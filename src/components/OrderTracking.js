'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import InteractiveMap from './InteractiveMap';
import DeliveryPublisher from './DeliveryPublisher';

export default function OrderTracking({ orderId }) {
  const { user, fetchWithAuth } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timer;
    let pending = false;
    const controller = new AbortController();
    async function refresh() {
      if (pending || cancelled) return;
      clearTimeout(timer);
      pending = true;
      setNow(Date.now());
      try {
        const response = await fetchWithAuth(`/api/orders/${orderId}/tracking`, { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
        const data = await response.json();
        if (!response.ok) {
          if (!cancelled && [401, 403, 404].includes(response.status)) setSnapshot(null);
          throw new Error(data.error);
        }
        if (!cancelled) { setSnapshot({ ...data, userId: user.id_usuario }); setError(''); }
      } catch (err) { if (!cancelled) setError(err instanceof TypeError || err.name === 'TimeoutError' ? 'Sin conexión. Intentando reconectar…' : err.message || 'No se pudo consultar el pedido.'); }
      finally { pending = false; if (!cancelled) timer = setTimeout(refresh, 10000); }
    }
    function reconnect() { if (!document.hidden) refresh(); }
    refresh();
    const ageTimer = setInterval(() => setNow(Date.now()), 10000);
    window.addEventListener('online', reconnect);
    document.addEventListener('visibilitychange', reconnect);
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); clearInterval(ageTimer); window.removeEventListener('online', reconnect); document.removeEventListener('visibilitychange', reconnect); };
  }, [orderId, user, fetchWithAuth]);
  if (!user) return <div className="container section-padding tracking-page"><h1>Seguimiento de pedido</h1><Link href="/auth/login">Inicia sesión para consultar tu entrega</Link></div>;
  const current = snapshot?.userId === user.id_usuario && String(snapshot?.order.id_pedido) === String(orderId) ? snapshot : null;
  return <div className="container section-padding tracking-page"><Link href="/profile">Volver a mis pedidos</Link><h1>Pedido #{orderId}</h1>
    <p role="status">{current ? `Estado: ${current.order.estado_pedido}` : error || 'Consultando pedido…'}</p>
    <InteractiveMap location={current?.location} checkedAt={current?.checkedAt} error={error} now={now} />
    {user.id_rol === 1 && current?.order.estado_pedido === 'Enviado' && <DeliveryPublisher key={orderId} orderId={orderId} />}
  </div>;
}
