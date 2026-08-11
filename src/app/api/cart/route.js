import { NextResponse } from 'next/server';
import { getCarritoDB, saveItemCarritoDB, updateCantidadCarritoDB, removeItemCarritoDB, clearCarritoDB } from '@/lib/mockData';
import { getSession } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: true, items: [] });
    }
    const items = await getCarritoDB(session.id_usuario);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ success: false, items: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ success: true, items: [] });
    }
    const body = await request.json();
    const { action, product, quantity, id_producto } = body;

    if (action === 'add' && product) {
      await saveItemCarritoDB(session.id_usuario, product, quantity || 1);
    } else if (action === 'update' && id_producto) {
      await updateCantidadCarritoDB(session.id_usuario, id_producto, quantity);
    } else if (action === 'remove' && id_producto) {
      await removeItemCarritoDB(session.id_usuario, id_producto);
    } else if (action === 'clear') {
      await clearCarritoDB(session.id_usuario);
    }

    const items = await getCarritoDB(session.id_usuario);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar carrito' }, { status: 500 });
  }
}
