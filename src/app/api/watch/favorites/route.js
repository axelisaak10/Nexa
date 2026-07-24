import { NextResponse } from 'next/server';

// In-memory favorites store per watch session token
const watchFavorites = new Map();

// POST /api/watch/favorites → toggle favorite (called by smartwatch)
export async function POST(request) {
  const body = await request.json();
  const { token, product } = body;
  if (!token || !product) {
    return NextResponse.json({ error: 'token and product required' }, { status: 400 });
  }

  const favs = watchFavorites.get(token) || [];
  const idx = favs.findIndex(f => f.id_producto === product.id_producto);
  let added;
  if (idx >= 0) {
    favs.splice(idx, 1);
    added = false;
  } else {
    favs.push({ ...product, savedAt: Date.now() });
    added = true;
  }
  watchFavorites.set(token, favs);

  return NextResponse.json({ success: true, added, count: favs.length });
}

// GET /api/watch/favorites?token=xxx → get all favorites for session
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const favs = watchFavorites.get(token) || [];
  return NextResponse.json({ favorites: favs });
}
