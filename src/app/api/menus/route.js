import { NextResponse } from 'next/server';
import { getMenusLaterales } from '@/lib/mockData';

export async function GET() {
  try {
    const menus = await getMenusLaterales();
    return NextResponse.json({ menus });
  } catch (error) {
    console.error('Menus API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sidebar menus' }, { status: 500 });
  }
}
