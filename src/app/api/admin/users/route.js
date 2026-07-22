import { NextResponse } from 'next/server';
import { getUsuarios, updateRolUsuario } from '@/lib/mockData';

export async function GET() {
  try {
    const usuarios = await getUsuarios();
    return NextResponse.json({ success: true, usuarios });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id_usuario, id_rol } = await request.json();
    const result = await updateRolUsuario(id_usuario, id_rol);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user role' }, { status: 500 });
  }
}
