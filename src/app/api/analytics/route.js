import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/mockData';
import { getSession, isAdmin } from '@/lib/authHelper';

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const analytics = await getAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
