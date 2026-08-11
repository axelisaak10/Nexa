import { NextResponse } from 'next/server';
import { setPinUsuario } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function POST(request) {
  try {
    const session = getSession(request);
    const body = await request.json().catch(() => ({}));
    const { id_usuario, pin } = body;

    const targetPin = pin || body.newPin;
    if (!targetPin || String(targetPin).length !== 4 || !/^\d{4}$/.test(String(targetPin))) {
      return NextResponse.json({ success: false, error: 'El PIN debe ser de exactamente 4 dígitos numéricos' }, { status: 400 });
    }

    const targetId = id_usuario || session?.id_usuario;
    if (!targetId) {
      return NextResponse.json({ success: false, error: 'ID de usuario requerido o inicia sesión' }, { status: 400 });
    }

    const result = await setPinUsuario(targetId, targetPin);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PIN set error:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar PIN' }, { status: 500 });
  }
}
