import { createClient } from '@supabase/supabase-js';
import { getSession, isAdmin } from './authHelper';

export function mobileDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Object.assign(new Error('El servicio móvil todavía no está configurado.'), { status: 503 });
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function mobileSession(request, adminOnly = false) {
  const session = getSession(request);
  if (!session) throw Object.assign(new Error('Inicia sesión para continuar.'), { status: 401 });
  const db = mobileDatabase();
  const { data, error } = await db.from('usuarios').select('id_usuario, id_rol').eq('id_usuario', session.id_usuario).maybeSingle();
  if (error) throw Object.assign(new Error('No se pudo verificar la cuenta.'), { status: 503 });
  if (!data || (adminOnly && !isAdmin(data))) throw Object.assign(new Error('No tienes acceso a esta función.'), { status: 403 });
  return { db, session: data };
}

export function mobileError(error) {
  return Response.json({ success: false, error: error.status ? error.message : 'No se pudo completar la operación. Intenta nuevamente.' },
    { status: error.status || 503, headers: { 'Cache-Control': 'no-store' } });
}
