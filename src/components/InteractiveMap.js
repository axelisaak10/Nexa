'use client';
import Link from 'next/link';
import { validCoordinates } from '@/lib/mobile';

export default function InteractiveMap({ title = 'Seguimiento de entrega', location = null, error = '', checkedAt = null, now = 0 }) {
  const valid = location && validCoordinates(location.latitude, location.longitude);
  const updated = location ? Date.parse(location.updated_at) : NaN;
  const stale = !Number.isFinite(updated) || now - updated > 120000;
  let mapUrl;
  if (valid) {
    const lat = location.latitude;
    const lng = location.longitude;
    const bounds = [Math.max(-180, lng - .015), Math.max(-90, lat - .01), Math.min(180, lng + .015), Math.min(90, lat + .01)].join(',');
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${lat},${lng}`;
  }
  return <section className="mobile-feature" aria-label={title}>
    <h3>{title}</h3>
    {error && <p role="alert">{error} La última posición disponible puede estar desactualizada.</p>}
    {valid ? <>
      <p role="status">{stale || error ? 'Última posición conocida · sin datos recientes' : 'Posición recibida recientemente'}</p>
      <iframe title="Ubicación del repartidor" src={mapUrl} className="delivery-map" loading="lazy" referrerPolicy="no-referrer" />
      <p>Última posición: {Number.isFinite(updated) ? new Date(updated).toLocaleString('es-MX') : 'sin fecha'}.</p>
      {Number.isFinite(location.accuracy) && <p className="mobile-help">Precisión aproximada: {Math.round(location.accuracy)} metros.</p>}
      <a href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`} target="_blank" rel="noopener noreferrer">Abrir mapa · © OpenStreetMap</a>
    </> : <><p>Aún no hay ubicación disponible para esta entrega. La posición aparecerá cuando se comparta durante el reparto.</p><Link href="/profile">Consultar mis pedidos</Link></>}
    {checkedAt && <p className="mobile-help">Estado consultado: {new Date(checkedAt).toLocaleTimeString('es-MX')}. Actualización automática cada 10 segundos.</p>}
  </section>;
}
