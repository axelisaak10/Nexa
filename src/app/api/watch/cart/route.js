import { NextResponse } from 'next/server';

// In-memory cart store per watch session token
// { token: { items: [...], lastUpdated: timestamp } }
const watchCarts = new Map();

// POST /api/watch/cart → add item to watch cart (called by smartwatch)
export async function POST(request) {
  const body = await request.json();
  const { token, product } = body;
  if (!token || !product) {
    return NextResponse.json({ error: 'token and product required' }, { status: 400 });
  }

  const cart = watchCarts.get(token) || { items: [], lastUpdated: 0 };
  const existing = cart.items.find(i => i.id_producto === product.id_producto);
  if (existing) {
    existing.cantidad = (existing.cantidad || 1) + 1;
  } else {
    cart.items.push({ ...product, cantidad: 1, addedAt: Date.now() });
  }
  cart.lastUpdated = Date.now();
  watchCarts.set(token, cart);

  return NextResponse.json({ success: true, itemCount: cart.items.length });
}

// GET /api/watch/cart?token=xxx&since=timestamp → get items added since timestamp (polled by web)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const since = parseInt(searchParams.get('since') || '0', 10);

  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const cart = watchCarts.get(token);
  if (!cart) return NextResponse.json({ items: [], lastUpdated: 0 });

  const newItems = cart.items.filter(i => i.addedAt > since);
  return NextResponse.json({ items: newItems, lastUpdated: cart.lastUpdated });
}

// DELETE /api/watch/cart?token=xxx → clear watch cart
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (token) watchCarts.delete(token);
  return NextResponse.json({ success: true });
}
