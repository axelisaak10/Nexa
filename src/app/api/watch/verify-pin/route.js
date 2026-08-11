import { NextResponse } from 'next/server';
import { verificarPinByToken } from '@/lib/mockData';

export async function POST(request) {
  try {
    const { token, pin } = await request.json();
    if (!token || !pin) {
      return NextResponse.json({ success: false, error: 'Token y PIN requeridos' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, error: 'PIN debe ser 4 dígitos' }, { status: 400 });
    }
    const result = await verificarPinByToken(token, pin);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Watch PIN verify error:', error);
    return NextResponse.json({ success: false, error: 'Error al verificar PIN' }, { status: 500 });
  }
}
