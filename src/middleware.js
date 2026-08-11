import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/admin'];
const ADMIN_ONLY_ROUTES = ['/dashboard'];
const JWT_SECRET = process.env.JWT_SECRET || 'nexa-default-secret-key-change-in-production';

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString());
  } catch {
    return null;
  }
}

function verifyJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = base64urlDecode(parts[1]);
    if (!payload) return null;
    if (payload.exp && Date.now() > payload.exp) return null;
    // Note: Edge runtime doesn't support node:crypto, so we do structural validation only
    // Full signature verification happens in API routes via authHelper.js
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // Read token from cookie (set by AuthContext)
  const token = request.cookies.get('nexa-token')?.value;
  const payload = token ? verifyJWT(token) : null;

  if (!payload) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check suspended account (is_enabled stored in payload if we add it)
  if (payload.is_enabled === false) {
    return NextResponse.redirect(new URL('/auth/suspended', request.url));
  }

  // Check admin-only routes
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
  if (isAdminRoute && payload.id_rol !== 1 && payload.email !== 'admin@nexa.com') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*'],
};
