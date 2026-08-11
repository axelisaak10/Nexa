import { NextResponse } from 'next/server';
import { getUsuarios, updateRolUsuario, toggleEstadoUsuario, createUsuarioAdmin } from '@/lib/mockData';
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
    const { id_usuario, id_rol, is_enabled } = body;
    if (!id_usuario) {
      return NextResponse.json({ success: false, error: 'ID de usuario requerido' }, { status: 400 });
    }
    // Handle is_enabled toggle
    if (typeof is_enabled === 'boolean') {
      const result = await toggleEstadoUsuario(id_usuario, is_enabled);
      return NextResponse.json(result);
    }
    // Handle role change
    if (id_rol !== undefined) {
      const result = await updateRolUsuario(id_usuario, id_rol);
      return NextResponse.json(result);
    }
    return NextResponse.json({ success: false, error: 'Nada que actualizar' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
