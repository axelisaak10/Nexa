import { mobileSession, mobileError } from '@/lib/mobileServer';

export async function POST(request) {
  try {
    const { db, session } = await mobileSession(request);
    const { token } = await request.json();
    if (!/^[A-HJ-NP-Z2-9]{8}$/.test(token || '')) return Response.json({ error: 'Código de vinculación inválido.' }, { status: 400 });
    // Bind only a live pending session; never trust a supplied user ID or reassign a confirmed session.
    const { data, error } = await db.from('qr_sessions').update({ status: 'confirmed', user_id: session.id_usuario })
      .eq('token', token).eq('status', 'pending').gte('created_at', new Date(Date.now() - 600000).toISOString()).lte('created_at', new Date().toISOString()).select('token').maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: 'El código venció o ya fue utilizado. Genera uno nuevo en el dispositivo.' }, { status: 409 });
    return Response.json({ success: true });
  } catch (error) { return mobileError(error); }
}
