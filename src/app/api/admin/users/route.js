import { NextResponse } from 'next/server';
import { getUsuarios, updateRolUsuario, toggleEstadoUsuario, createUsuarioAdmin, updateUsuarioAdmin } from '@/lib/mockData';
import { getSession, isAdmin } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const usuarios = await getUsuarios();
    return NextResponse.json({ success: true, usuarios });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSession(request);
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { nombre, email, password, id_rol } = body;
    if (!nombre || !email || !password) {
      return NextResponse.json({ success: false, error: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
    }
    const result = await createUsuarioAdmin({ nombre, email, password, id_rol });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = getSession(request);
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id_usuario, nombre, email, id_rol, is_enabled, password, pin } = body;
    if (!id_usuario) {
      return NextResponse.json({ success: false, error: 'ID de usuario requerido' }, { status: 400 });
    }
    const result = await updateUsuarioAdmin(id_usuario, { nombre, email, id_rol, is_enabled, password, pin });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
