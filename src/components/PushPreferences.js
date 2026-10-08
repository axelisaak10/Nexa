'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function PushPreferences() {
  const { fetchWithAuth } = useAuth();
  const [orders, setOrders] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        if (!('serviceWorker' in navigator)) return;
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager?.getSubscription();
        if (!subscription) return;
        const response = await fetchWithAuth('/api/push', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const preferences = data.preferences?.find(item => item.endpoint === subscription.endpoint);
        if (!cancelled && preferences) { setOrders(preferences.orders); setPromotions(preferences.promotions); }
      } catch { /* The user can retry with Save. */ }
    }
    restore();
    return () => { cancelled = true; };
  }, [fetchWithAuth]);
  async function save(disable = false) {
    setBusy(true);
    try {
      if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) throw new Error('Este navegador no admite alertas. Consulta tus pedidos en el perfil. En iPhone, prueba desde la app instalada en la pantalla de inicio.');
      // Permission must be requested directly from the user's gesture on Safari.
      const permission = disable ? Notification.permission : await Notification.requestPermission();
      if (!disable && permission !== 'granted') throw new Error('No se autorizaron las notificaciones. Puedes cambiarlas en los ajustes del navegador.');
      await navigator.serviceWorker.register('/sw.js');
      const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('No se pudo activar el servicio. Intenta de nuevo.')), 10000))]);
      let subscription = await registration.pushManager.getSubscription();
      if (disable) {
        if (subscription) {
          const response = await fetchWithAuth('/api/push', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
          if (!response.ok) throw new Error('No se pudieron desactivar las alertas. Intenta de nuevo.');
          await subscription.unsubscribe();
        }
        setMessage('Alertas desactivadas en este dispositivo.');
        return;
      }
      const configResponse = await fetchWithAuth('/api/push', { cache: 'no-store' });
      const config = await configResponse.json();
      if (!configResponse.ok || !config.publicKey) throw new Error(config.error || 'Las alertas todavía no están disponibles.');
      if (!subscription) {
        const base64 = config.publicKey.replace(/-/g, '+').replace(/_/g, '/');
        const key = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), c => c.charCodeAt(0));
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      }
      const response = await fetchWithAuth('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: subscription.toJSON(), orders, promotions }) });
      if (!response.ok) throw new Error('No se guardaron las preferencias. Intenta de nuevo.');
      setMessage('Preferencias guardadas para este dispositivo.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <section className="mobile-feature">
    <h3>Notificaciones</h3>
    <p>Elige las alertas que quieres recibir en este dispositivo.</p>
    <label><input type="checkbox" checked={orders} onChange={e => setOrders(e.target.checked)} /> Cambios de mis pedidos</label>
    <label><input type="checkbox" checked={promotions} onChange={e => setPromotions(e.target.checked)} /> Promociones</label>
    <div className="mobile-actions"><button className="btn-secondary" disabled={busy} onClick={() => save()}>Guardar y activar</button><button className="btn-secondary" disabled={busy} onClick={() => save(true)}>Desactivar alertas</button></div>
    <p role="status">{message}</p>
  </section>;
}
