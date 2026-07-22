import { NextResponse } from 'next/server';
import { createMensajeContacto } from '@/lib/mockData';

export async function POST(request) {
  try {
    const { nombre, email, mensaje } = await request.json();
    
    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const result = await createMensajeContacto({ nombre, email, mensaje });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
