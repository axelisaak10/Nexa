import { NextResponse } from 'next/server';
import { getPedidos, updateEstadoPedido } from '@/lib/mockData';
import { getSession, isAdmin } from '@/lib/authHelper';
import { mobileSession, mobileError } from '@/lib/mobileServer';
import { ORDER_STATUSES } from '@/lib/mobile';
import { sendOrderPush } from '@/lib/pushServer';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const pedidos = await getPedidos();
    return NextResponse.json({ success: true, pedidos });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!isAdmin(getSession(request))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const { id_pedido, estado_pedido } = await request.json();
    if (!Number.isSafeInteger(Number(id_pedido)) || Number(id_pedido) <= 0 || !ORDER_STATUSES.includes(estado_pedido)) return NextResponse.json({ error: 'Estado o pedido inválido.' }, { status: 400 });
    // Preserve the existing order editor until the optional mobile server is configured.
    // Never send notifications from the legacy/mock fallback.
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const result = await updateEstadoPedido(id_pedido, estado_pedido);
      return NextResponse.json({ ...result, notifications: { configured: false, sent: 0, failed: 0 } });
    }
    const { db } = await mobileSession(request, true);
    const { data: before, error } = await db.from('pedidos').select('id_pedido, estado_pedido').eq('id_pedido', id_pedido).maybeSingle();
    if (error) throw error;
    if (!before) return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    if (before.estado_pedido === estado_pedido) return NextResponse.json({ success: true, unchanged: true });
    const result = await db.from('pedidos').update({ estado_pedido }).eq('id_pedido', id_pedido).eq('estado_pedido', before.estado_pedido).select().maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return NextResponse.json({ error: 'El pedido cambió. Actualiza antes de intentarlo de nuevo.' }, { status: 409 });
    const notifications = await sendOrderPush(db, result.data).catch(() => ({ sent: 0, failed: 1 }));
    return NextResponse.json({ success: true, pedido: result.data, notifications });
  } catch (error) {
    return mobileError(error);
  }
}

