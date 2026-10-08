import { getSession } from '@/lib/authHelper';
import { validCoordinates, addressFromGeocoder } from '@/lib/mobile';
import { mobileError } from '@/lib/mobileServer';

export async function POST(request) {
  if (!getSession(request)) return Response.json({ error: 'Inicia sesión para sugerir una dirección.' }, { status: 401 });
  try {
    const { latitude, longitude } = await request.json();
    if (!validCoordinates(latitude, longitude)) return Response.json({ error: 'Ubicación inválida.' }, { status: 400 });
    // Configure a Nominatim-compatible provider. No customer coordinates are sent to an unconfigured service.
    if (!process.env.GEOCODER_URL) return Response.json({ error: 'Las sugerencias de dirección no están disponibles. Escribe tu dirección manualmente.' }, { status: 503 });
    const url = new URL(process.env.GEOCODER_URL);
    url.searchParams.set('lat', latitude);
    url.searchParams.set('lon', longitude);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'es');
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Nexa/1.0', ...(process.env.GEOCODER_API_KEY ? { Authorization: `Bearer ${process.env.GEOCODER_API_KEY}` } : {}) } });
    if (!response.ok) throw new Error('Geocoder unavailable');
    const result = await response.json();
    if (!result.address) return Response.json({ error: 'No se encontró una dirección. Puedes escribirla manualmente.' }, { status: 404 });
    return Response.json({ address: addressFromGeocoder(result.address) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return mobileError(error); }
}
