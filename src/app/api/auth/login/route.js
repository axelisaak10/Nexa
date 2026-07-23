import { NextResponse } from 'next/server';
import { loginUsuario } from '@/lib/mockData';
import { sign } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const result = await loginUsuario(email, password);
    if (result.success && result.user) {
      const token = sign({
        id_usuario: result.user.id_usuario,
        nombre: result.user.nombre,
        email: result.user.email,
        id_rol: result.user.id_rol
      });
      return NextResponse.json({ success: true, user: result.user, token });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

