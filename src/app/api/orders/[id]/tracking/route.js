import { mobileSession, mobileError } from '@/lib/mobileServer';
import { validCoordinates, ACTIVE_DELIVERY_STATUSES } from '@/lib/mobile';

export async function GET(request, context) {
  try {
    const { db, session } = await mobileSession(request);
    const { id } = await context.params;
    if (!/^\d{1,10}$/.test(id)) return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
    let query = db.from('pedidos').select('id_pedido, estado_pedido, fecha_pedido').eq('id_pedido', id);
    if (session.id_rol !== 1) query = query.eq('id_usuario', session.id_usuario);
    const { data: order, error } = await query.maybeSingle();
    if (error) throw error;
    if (!order) return Response.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    let location = null;
    if (ACTIVE_DELIVERY_STATUSES.includes(order.estado_pedido)) {
      const result = await db.from('order_tracking').select('latitude, longitude, accuracy, updated_at').eq('id_pedido', id).maybeSingle();
      if (result.error) throw result.error;
      location = result.data;
    }
    return Response.json({ order, location, checkedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return mobileError(error); }
}

export async function POST(request, context) {
  try {
    const { db } = await mobileSession(request, true);
    const { id } = await context.params;
    if (!/^\d{1,10}$/.test(id)) return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
    const { latitude, longitude, accuracy } = await request.json();
    if (!validCoordinates(latitude, longitude) || !Number.isFinite(accuracy) || accuracy < 0) return Response.json({ error: 'Ubicación inválida.' }, { status: 400 });
    const { data: order, error } = await db.from('pedidos').select('estado_pedido').eq('id_pedido', id).maybeSingle();
    if (error) throw error;
    if (!order || !ACTIVE_DELIVERY_STATUSES.includes(order.estado_pedido)) return Response.json({ error: 'Solo puedes compartir ubicación de un pedido enviado.' }, { status: 409 });
    const { error: updateError } = await db.from('order_tracking').upsert({ id_pedido: Number(id), latitude, longitude, accuracy, updated_at: new Date().toISOString() });
    if (updateError) throw updateError;
    return Response.json({ success: true });
  } catch (error) { return mobileError(error); }
}
