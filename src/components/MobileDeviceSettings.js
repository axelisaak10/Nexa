'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pairingToken, createShakeDetector, hapticFeedback } from '@/lib/mobile';

export default function MobileDeviceSettings() {
  const { fetchWithAuth } = useAuth();
  const [haptics, setHaptics] = useState(false);
  const [motion, setMotion] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const stopScan = useRef(() => {});
  useEffect(() => {
    try { Promise.resolve().then(() => setHaptics(localStorage.getItem('nexa-haptics') === 'true')); } catch {}
    return () => stopScan.current();
  }, []);
  useEffect(() => {
    if (!motion) return;
    const detect = createShakeDetector();
    function onMotion(event) {
      if (document.hidden) return;
      if (detect(event.accelerationIncludingGravity, Date.now())) window.dispatchEvent(new Event('nexa-show-promotions'));
    }
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [motion]);
  function toggleHaptics() {
    try {
      if (!navigator.vibrate) { setMessage('La vibración no está disponible en este dispositivo.'); return; }
      localStorage.setItem('nexa-haptics', String(!haptics));
      setHaptics(!haptics);
      if (!haptics) hapticFeedback();
    } catch { setMessage('No se pudo guardar esta preferencia.'); }
  }
  async function toggleMotion() {
    if (motion) { setMotion(false); return; }
    try {
      if (!window.isSecureContext || !window.DeviceMotionEvent) throw new Error('El movimiento no está disponible. Usa el botón Ver promociones.');
      if (typeof DeviceMotionEvent.requestPermission === 'function' && await DeviceMotionEvent.requestPermission() !== 'granted') throw new Error('Permiso de movimiento denegado. Puedes usar Ver promociones.');
      setMotion(true);
      setMessage('Agita el teléfono varias veces para ver promociones mientras esta pantalla esté abierta.');
    } catch (error) { setMessage(error.message); }
  }
  async function scan() {
    if (!window.isSecureContext || !('NDEFReader' in window)) { setMessage('NFC no está disponible aquí. Introduce el código del dispositivo o abre su código QR.'); return; }
    stopScan.current();
    const controller = new AbortController();
    const reader = new window.NDEFReader();
    let timeout;
    const stop = () => { controller.abort(); clearTimeout(timeout); document.removeEventListener('visibilitychange', onHide); setScanning(false); };
    function onHide() { if (document.hidden) stop(); }
    stopScan.current = stop;
    setScanning(true);
    setMessage('Acerca una etiqueta NFC de vinculación de Nexa.');
    reader.onreading = event => {
      for (const record of event.message.records) {
        if (!['text', 'url'].includes(record.recordType)) continue;
        try {
          const value = new TextDecoder(record.encoding || 'utf-8').decode(record.data);
          const token = pairingToken(value, window.location.origin);
          if (token) { setCode(token); setMessage('Código leído. Confirma la vinculación con tu cuenta.'); stop(); return; }
        } catch { /* Ignore unsupported encodings and record types. */ }
      }
      setMessage('La etiqueta no contiene un código Nexa válido. Intenta otra o escribe el código.');
    };
    reader.onreadingerror = () => setMessage('No se pudo leer la etiqueta. Acércala otra vez.');
    document.addEventListener('visibilitychange', onHide);
    try {
      await reader.scan({ signal: controller.signal });
      if (controller.signal.aborted) return;
      timeout = setTimeout(() => { stop(); setMessage('Lectura finalizada. Puedes intentarlo otra vez.'); }, 30000);
    } catch (error) { stop(); if (error.name !== 'AbortError') setMessage('No se pudo activar NFC. Revisa el permiso o usa el código manual.'); }
  }
  async function pair(event) {
    event.preventDefault();
    const token = pairingToken(code, window.location.origin);
    if (!token) { setMessage('Introduce un código Nexa válido de 8 caracteres.'); return; }
    stopScan.current();
    setPairing(true);
    try {
      const response = await fetchWithAuth('/api/devices/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCode('');
      setMessage('Dispositivo vinculado a tu cuenta.');
      hapticFeedback();
    } catch (error) { setMessage(error.message); }
    finally { setPairing(false); }
  }
  return <section className="mobile-feature"><h3>Funciones del teléfono</h3>
    <div className="mobile-actions"><button className="btn-secondary" aria-pressed={haptics} onClick={toggleHaptics}>{haptics ? 'Desactivar vibración' : 'Activar vibración'}</button><button className="btn-secondary" aria-pressed={motion} onClick={toggleMotion}>{motion ? 'Desactivar movimiento' : 'Activar promociones al agitar'}</button><button className="btn-secondary" onClick={() => window.dispatchEvent(new Event('nexa-show-promotions'))}>Ver promociones</button></div>
    <h4>Vincular un dispositivo</h4><p>Lee una etiqueta NFC o escribe el código temporal que muestra el dispositivo. La vinculación se hará cuando confirmes.</p>
    <button className="btn-secondary" disabled={pairing} onClick={scanning ? () => stopScan.current() : scan}>{scanning ? 'Cancelar lectura' : 'Leer etiqueta NFC'}</button>
    <form onSubmit={pair}><label htmlFor="pairing-code">Código o enlace de vinculación</label><input id="pairing-code" className="auth-input" value={code} onChange={e => setCode(e.target.value)} maxLength={2048} required autoComplete="off" /><button className="btn-secondary" disabled={pairing || !code}>{pairing ? 'Vinculando…' : 'Confirmar vinculación'}</button></form>
    <p className="mobile-help">NFC se utiliza para vincular dispositivos. Para comprar, usa los métodos disponibles en el pago.</p><p role="status">{message}</p>
  </section>;
}
