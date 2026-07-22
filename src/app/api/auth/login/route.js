import { NextResponse } from 'next/server';
import { loginUsuario } from '@/lib/mockData';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const result = await loginUsuario(email, password);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
