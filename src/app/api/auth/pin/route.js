import { NextResponse } from 'next/server';
import { setPinUsuario } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function POST(request) {
  try {
    const { id_usuario, pin } = await request.json();
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: 'El PIN debe ser de exactamente 4 dígitos numéricos' }, { status: 400 });
    }
    const targetId = id_usuario;
    if (!targetId) {
      return NextResponse.json({ success: false, error: 'ID de usuario requerido' }, { status: 400 });
    }
    const result = await setPinUsuario(targetId, pin);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PIN set error:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar PIN' }, { status: 500 });
  }
}
