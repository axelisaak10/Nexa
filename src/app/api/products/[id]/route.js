import { NextResponse } from 'next/server';
import { getProductoById } from '@/lib/mockData';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProductoById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

