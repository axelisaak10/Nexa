'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LocationAddress({ onApply }) {
  const { fetchWithAuth } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  async function locate() {
    setSuggestion(null);
    if (!window.isSecureContext || !navigator.geolocation) {
      setMessage('La ubicación no está disponible aquí. Escribe tu dirección manualmente.');
      return;
    }
    setBusy(true);
    setMessage('Buscando tu ubicación…');
    try {
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }));
      const res = await fetchWithAuth('/api/address/locate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuggestion(data.address);
      setMessage('Revisa la dirección sugerida. Completa el número exterior e interior si hace falta.');
    } catch (error) {
      setMessage(error.code === 1 ? 'No autorizaste la ubicación. Puedes escribir la dirección.' : error.code ? 'No se pudo obtener tu ubicación. Intenta de nuevo o escribe la dirección.' : error.message);
    } finally { setBusy(false); }
  }
  return <div className="mobile-feature">
    <button type="button" className="btn-secondary" disabled={busy} onClick={locate}>{busy ? 'Buscando…' : 'Usar mi ubicación'}</button>
    <p className="mobile-help">Al continuar, tu ubicación se enviará al servicio de mapas para sugerir una dirección.</p>
    <p role="status">{message}</p>
    {suggestion && <><p>{Object.values(suggestion).filter(Boolean).join(', ')}</p><button type="button" className="btn-secondary" onClick={() => { onApply(suggestion); setSuggestion(null); setMessage('Dirección incorporada. Revisa y completa los campos antes de guardar.'); }}>Usar esta dirección</button></>}
  </div>;
}
