import { NextResponse } from 'next/server';
import { getMetricas } from '@/lib/mockData';

export async function GET() {
  try {
    const metrics = await getMetricas();
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
