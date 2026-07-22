import { NextResponse } from 'next/server';
import { updateEstadoPedido, getPedidos } from '@/lib/mockData';

export async function GET() {
  try {
    const pedidos = await getPedidos();
    return NextResponse.json({ success: true, pedidos });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id_pedido, estado_pedido } = await request.json();
    const result = await updateEstadoPedido(id_pedido, estado_pedido);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}
