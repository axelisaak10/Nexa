import { NextResponse } from 'next/server';
import { getBanners } from '@/lib/mockData';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('Banners GET error:', error);
    return NextResponse.json({ success: false, banners: [] }, { status: 500 });
  }
}
