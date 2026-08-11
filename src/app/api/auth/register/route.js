import { NextResponse } from 'next/server';
import { registerUsuario } from '@/lib/mockData';
import { sign } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { nombre, email, password } = await request.json();
    
    if (!nombre || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const result = await registerUsuario(nombre, email, password);
    if (result.success && result.user) {
      const token = sign({
        id_usuario: result.user.id_usuario,
        nombre: result.user.nombre,
        email: result.user.email,
        id_rol: result.user.id_rol,
        is_enabled: true
      });
      return NextResponse.json({ success: true, user: result.user, token });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}

