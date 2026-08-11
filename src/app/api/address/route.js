import { NextResponse } from 'next/server';
import { getDireccionByUsuario, saveDireccion } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const direccion = await getDireccionByUsuario(session.id_usuario);
    return NextResponse.json({ success: true, direccion });
  } catch (error) {
    console.error('Address GET error:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener dirección' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const body = await request.json();
    const { calle_numero, colonia, ciudad, codigo_postal, telefono_contacto } = body;
    if (!calle_numero || !ciudad || !codigo_postal) {
      return NextResponse.json({ success: false, error: 'Datos de dirección incompletos' }, { status: 400 });
    }
    const result = await saveDireccion(session.id_usuario, { calle_numero, colonia, ciudad, codigo_postal, telefono_contacto });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Address POST error:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar dirección' }, { status: 500 });
  }
}
