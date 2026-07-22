import { NextResponse } from 'next/server';
import { getCategorias } from '@/lib/mockData';

export async function GET() {
  try {
    const categories = await getCategorias();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
