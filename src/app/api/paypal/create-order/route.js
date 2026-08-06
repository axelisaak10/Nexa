import { NextResponse } from 'next/server';

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
    const { amount } = await request.json();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Monto de orden inválido' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: Number(amount).toFixed(2),
            },
          },
        ],
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('Error al crear orden en PayPal:', orderData);
      return NextResponse.json({ error: orderData.message || 'Error al crear orden PayPal' }, { status: orderResponse.status });
    }

    return NextResponse.json({ id: orderData.id, status: orderData.status });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
