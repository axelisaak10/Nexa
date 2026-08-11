import { NextResponse } from 'next/server';
import { updatePerfilUsuario } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function PUT(request) {
  try {
    const session = getSession(request);
    if (!session || !session.id_usuario) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const body = await request.json();
    const { nombre, email, password, pin } = body;
    const result = await updatePerfilUsuario(session.id_usuario, { nombre, email, password, pin });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
