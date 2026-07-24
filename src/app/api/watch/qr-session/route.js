import { NextResponse } from 'next/server';

// In-memory store for QR sessions (TTL: 3 minutes)
// Structure: { token: { status: 'pending'|'confirmed'|'expired', userId, createdAt } }
const qrSessions = new Map();

// Cleanup expired sessions every 5 minutes
function cleanupExpired() {
  const now = Date.now();
  for (const [token, session] of qrSessions.entries()) {
    if (now - session.createdAt > 3 * 60 * 1000) {
      qrSessions.delete(token);
    }
  }
}

// Generate a short alphanumeric token (8 chars)
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// POST /api/watch/qr-session → create a new QR session (called by smartwatch)
export async function POST() {
  cleanupExpired();
  const token = generateToken();
  qrSessions.set(token, {
    status: 'pending',
    userId: null,
    createdAt: Date.now(),
  });
  return NextResponse.json({ token, expiresInSeconds: 180 });
}

// GET /api/watch/qr-session?token=xxx → check status (polled by smartwatch after showing QR)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  cleanupExpired();
  const session = qrSessions.get(token);
  if (!session) return NextResponse.json({ status: 'expired' });

  const ageSeconds = (Date.now() - session.createdAt) / 1000;
  if (ageSeconds > 180) {
    qrSessions.delete(token);
    return NextResponse.json({ status: 'expired' });
  }

  return NextResponse.json({ status: session.status, userId: session.userId });
}

// PUT /api/watch/qr-session → web confirms token after user enters it (consumed by web)
export async function PUT(request) {
  const body = await request.json();
  const { token, userId } = body;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  cleanupExpired();
  const session = qrSessions.get(token);
  if (!session) return NextResponse.json({ success: false, error: 'Token expired or invalid' });

  const ageSeconds = (Date.now() - session.createdAt) / 1000;
  if (ageSeconds > 180) {
    qrSessions.delete(token);
    return NextResponse.json({ success: false, error: 'Token expired' });
  }

  if (session.status === 'confirmed') {
    return NextResponse.json({ success: false, error: 'Token already used' });
  }

  session.status = 'confirmed';
  session.userId = userId || 'guest';
  return NextResponse.json({ success: true, userId: session.userId });
}
