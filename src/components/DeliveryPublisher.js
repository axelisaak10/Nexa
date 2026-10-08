'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPublisher({ orderId }) {
  const { fetchWithAuth } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState('');
  const stopRef = useRef(() => {});
  useEffect(() => () => stopRef.current(), [orderId]);
  function stop() { stopRef.current(); setSharing(false); setMessage('Ubicación detenida. La última posición quedará marcada con su hora.'); }
  function start() {
    if (!window.isSecureContext || !navigator.geolocation) { setMessage('Este dispositivo no permite compartir ubicación.'); return; }
    setSharing(true);
    setMessage('Buscando ubicación…');
    let cancelled = false;
    let pending = false;
    let lastSent = -Infinity;
    const controller = new AbortController();
    const watch = navigator.geolocation.watchPosition(async position => {
      if (cancelled || pending || Date.now() - lastSent < 10000 || document.hidden) return;
      pending = true;
      lastSent = Date.now();
      try {
        const response = await fetchWithAuth(`/api/orders/${orderId}/tracking`, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }) });
        const data = await response.json();
        if (!response.ok) {
          if ([401, 403, 409].includes(response.status)) { stopRef.current(); setSharing(false); }
          throw new Error(data.error);
        }
        if (!cancelled) setMessage(`Posición compartida a las ${new Date().toLocaleTimeString('es-MX')}.`);
      } catch (error) { if (error.name !== 'AbortError') setMessage(error.message || 'No se pudo enviar. Se reintentará con la siguiente posición.'); }
      finally { pending = false; }
    }, error => {
      setMessage(error.code === 1 ? 'Permiso de ubicación denegado.' : 'No se puede obtener la ubicación.');
      if (error.code === 1) { stopRef.current(); setSharing(false); }
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    stopRef.current = () => { cancelled = true; navigator.geolocation.clearWatch(watch); controller.abort(); };
  }
  return <section className="mobile-feature"><h3>Compartir ubicación de esta entrega</h3><p>Usa esta función desde el teléfono que acompaña al pedido. Mantén la pantalla abierta durante el recorrido. Solo está disponible para administración.</p><button className="btn-secondary" onClick={sharing ? stop : start}>{sharing ? 'Detener ubicación' : 'Compartir mi ubicación'}</button><p role="status">{message}</p></section>;
}
