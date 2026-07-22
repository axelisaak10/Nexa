import { NextResponse } from 'next/server';
import { createProducto, updateProducto, deleteProducto, getProductos } from '@/lib/mockData';

export async function GET() {
  try {
    const products = await getProductos();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await createProducto(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id_producto, ...data } = await request.json();
    const result = await updateProducto(id_producto, data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const result = await deleteProducto(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
