import { NextResponse } from 'next/server';
import { createPedido, getPedidos } from '@/lib/mockData';
import { getSession, isAdmin } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Enforce IDOR protection: common users can only see their own orders.
    const userId = isAdmin(session) ? null : session.id_usuario;
    const orders = await getPedidos(userId);
    
    // Return both formats to support multiple clients
    return NextResponse.json({ success: true, orders, pedidos: orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSession(request);
    const body = await request.json();
    
    const { id_usuario, total, items, direccion, metodo_pago } = body;
    
    if (!total || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
    }
    
    // Format address object into a single string for table storage
    const direccion_envio = direccion
      ? `${direccion.calle_numero || ''}, ${direccion.colonia || ''}, ${direccion.ciudad || ''}, CP ${direccion.codigo_postal || ''}`
      : 'N/A';
      
    const orderData = {
      id_usuario: session ? session.id_usuario : (id_usuario || null),
      total,
      metodo_pago: metodo_pago || 'Tarjeta de crédito',
      direccion_envio,
      fecha_pedido: new Date().toISOString(),
      estado_pedido: 'Pendiente'
    };
    
    const orderItems = items.map(item => ({
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    }));
    
    const result = await createPedido(orderData, orderItems);
    
    if (result.success && result.pedido) {
      return NextResponse.json({
        success: true,
        id_pedido: result.pedido.id_pedido,
        pedido: result.pedido
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

