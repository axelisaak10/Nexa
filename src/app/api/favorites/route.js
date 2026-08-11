import { NextResponse } from 'next/server';
import { getFavoritosDB, toggleFavoritoDB } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: true, favorites: [] });
    }
    const favorites = await getFavoritosDB(session.id_usuario);
    return NextResponse.json({ success: true, favorites });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ success: false, favorites: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Inicia sesión para guardar en favoritos' }, { status: 401 });
    }
    const body = await request.json();
    const { product } = body;
    if (!product || !product.id_producto) {
      return NextResponse.json({ success: false, error: 'Producto no especificado' }, { status: 400 });
    }
    const result = await toggleFavoritoDB(session.id_usuario, product);
    const favorites = await getFavoritosDB(session.id_usuario);
    return NextResponse.json({ success: true, action: result.action, favorites });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar favoritos' }, { status: 500 });
  }
}
