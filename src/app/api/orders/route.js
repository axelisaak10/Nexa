import { NextResponse } from 'next/server';
import { createPedido, getPedidos } from '@/lib/mockData';

export async function GET() {
  try {
    const orders = await getPedidos();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createPedido(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
