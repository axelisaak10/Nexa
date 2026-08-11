import { NextResponse } from 'next/server';
import { verificarPin } from '@/lib/mockData';

export async function POST(request) {
  try {
    const { id_usuario, pin } = await request.json();
    if (!id_usuario || !pin) {
      return NextResponse.json({ success: false, error: 'Datos requeridos' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: 'PIN inválido' }, { status: 400 });
    }
    const result = await verificarPin(id_usuario, pin);
    if (!result.hasPin) {
      return NextResponse.json({ success: true, hasPin: false, message: 'Usuario sin PIN configurado' });
    }
    return NextResponse.json({ success: result.success, hasPin: true });
  } catch (error) {
    console.error('PIN verify error:', error);
    return NextResponse.json({ success: false, error: 'Error al verificar PIN' }, { status: 500 });
  }
}
