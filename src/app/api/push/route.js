import { mobileSession, mobileError } from '@/lib/mobileServer';
import { pushConfigured, validPushSubscription } from '@/lib/pushServer';

export async function GET(request) {
  try {
    const { db, session } = await mobileSession(request);
    const { data, error } = await db.from('push_subscriptions').select('endpoint, orders, promotions').eq('id_usuario', session.id_usuario);
    if (error) throw error;
    return Response.json({ publicKey: pushConfigured() ? process.env.VAPID_PUBLIC_KEY : null, preferences: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return mobileError(error); }
}

export async function POST(request) {
  try {
    const { db, session } = await mobileSession(request);
    if (!pushConfigured()) return Response.json({ error: 'Las alertas todavía no están disponibles.' }, { status: 503 });
    const { subscription, orders, promotions } = await request.json();
    if (!validPushSubscription(subscription) || typeof orders !== 'boolean' || typeof promotions !== 'boolean') return Response.json({ error: 'Suscripción inválida.' }, { status: 400 });
    const { error } = await db.from('push_subscriptions').upsert({ endpoint: subscription.endpoint, subscription, id_usuario: session.id_usuario, orders, promotions, updated_at: new Date().toISOString() });
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) { return mobileError(error); }
}

export async function DELETE(request) {
  try {
    const { db, session } = await mobileSession(request);
    const { endpoint } = await request.json();
    if (typeof endpoint !== 'string' || endpoint.length > 2048) return Response.json({ error: 'Suscripción inválida.' }, { status: 400 });
    const { error } = await db.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('id_usuario', session.id_usuario);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) { return mobileError(error); }
}
