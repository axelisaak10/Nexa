// Pure validation shared by browser, API routes and tests.
export function validCoordinates(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' &&
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function pairingToken(value, origin) {
  const text = String(value || '').trim();
  if (/^[A-HJ-NP-Z2-9]{8}$/.test(text)) return text;
  try {
    const url = new URL(text, origin);
    if (url.origin !== origin || url.pathname !== '/auth/watch') return null;
    const token = url.searchParams.get('token');
    return /^[A-HJ-NP-Z2-9]{8}$/.test(token || '') ? token : null;
  } catch { return null; }
}

export function addressFromGeocoder(address = {}) {
  return {
    calle_numero: [address.road || address.pedestrian, address.house_number].filter(Boolean).join(' '),
    colonia: address.suburb || address.neighbourhood || '',
    ciudad: [address.city || address.town || address.village || address.municipality, address.state].filter(Boolean).join(', '),
    codigo_postal: address.postcode || '',
  };
}

export function hapticFeedback() {
  try {
    if (localStorage.getItem('nexa-haptics') === 'true') navigator.vibrate?.(25);
  } catch { /* Storage or vibration may be unavailable. */ }
}

export function createShakeDetector() {
  let previous = null;
  let peaks = [];
  let lastTrigger = -Infinity;
  return (acceleration, now) => {
    if (!acceleration || !['x', 'y', 'z'].every(k => Number.isFinite(acceleration[k]))) return false;
    const current = [acceleration.x, acceleration.y, acceleration.z];
    const delta = previous ? Math.hypot(...current.map((n, i) => n - previous[i])) : 0;
    previous = current;
    peaks = peaks.filter(t => now - t < 1000);
    if (delta > 18 && (!peaks.length || now - peaks.at(-1) > 100)) peaks.push(now);
    if (peaks.length >= 3 && now - lastTrigger > 10000) {
      lastTrigger = now;
      peaks = [];
      return true;
    }
    return false;
  };
}

export const ORDER_STATUSES = ['Pendiente', 'Confirmado', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado'];
export const ACTIVE_DELIVERY_STATUSES = ['Enviado'];
