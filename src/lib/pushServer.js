import webpush from 'web-push';

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

export function validPushSubscription(value) {
  try {
    const url = new URL(value.endpoint);
    const allowed = url.hostname === 'fcm.googleapis.com' || url.hostname === 'updates.push.services.mozilla.com' ||
      url.hostname === 'web.push.apple.com' || url.hostname.endsWith('.notify.windows.com');
    return allowed && url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      typeof value.keys?.p256dh === 'string' && /^[A-Za-z0-9_-]{87}$/.test(value.keys.p256dh) &&
      typeof value.keys?.auth === 'string' && /^[A-Za-z0-9_-]{22}$/.test(value.keys.auth) && value.endpoint.length < 2048;
  } catch { return false; }
}

export async function sendOrderPush(db, order) {
  if (!pushConfigured() || !order.id_usuario) return { sent: 0, failed: 0, configured: false };
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const { data, error } = await db.from('push_subscriptions').select('endpoint, subscription').eq('id_usuario', order.id_usuario).eq('orders', true);
  if (error) return { sent: 0, failed: 1, configured: true };
  const outcomes = await Promise.all((data || []).map(async row => {
    if (!validPushSubscription(row.subscription)) return false;
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({ title: 'Nexa · Actualización de pedido', body: `Tu pedido está ${order.estado_pedido.toLowerCase()}.`, url: `/tracking/${order.id_pedido}`, tag: `order-${order.id_pedido}` }), { TTL: 3600, timeout: 5000 });
      return true;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await db.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
      return false;
    }
  }));
  return { sent: outcomes.filter(Boolean).length, failed: outcomes.filter(x => !x).length, configured: true };
}
