import { NextResponse } from 'next/server';
import { registerUsuario } from '@/lib/mockData';

export async function POST(request) {
  try {
    const { nombre, email, password } = await request.json();
    
    if (!nombre || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const result = await registerUsuario(nombre, email, password);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
