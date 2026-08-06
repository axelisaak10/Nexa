import { NextResponse } from 'next/server';
import { createPedido } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal Client ID or Secret Key is missing in environment variables.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to authenticate with PayPal API');
  }

  return data.access_token;
}

export async function POST(request) {
  try {
    const session = getSession(request);
    const body = await request.json();
    const { orderID, id_usuario, total, items, direccion } = body;

    if (!orderID) {
      return NextResponse.json({ success: false, error: 'ID de orden de PayPal requerido' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json({
        success: false,
        error: captureData.message || 'No se pudo capturar el pago de PayPal',
        details: captureData,
      }, { status: captureResponse.status });
    }

    // Format address object into single string for database
    const direccion_envio = direccion
      ? `${direccion.calle_numero || ''}, ${direccion.colonia || ''}, ${direccion.ciudad || ''}, CP ${direccion.codigo_postal || ''}`
      : 'N/A';

    const orderData = {
      id_usuario: session ? session.id_usuario : (id_usuario || null),
      total,
      metodo_pago: 'PayPal',
      direccion_envio,
      fecha_pedido: new Date().toISOString(),
      estado_pedido: 'Completado'
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
        pedido: result.pedido,
        paypalCapture: captureData
      });
    }

    return NextResponse.json({ success: false, error: result.error || 'Error al guardar pedido' }, { status: 500 });
  } catch (error) {
    console.error('PayPal capture order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
