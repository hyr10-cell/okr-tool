import { NextResponse } from 'next/server';

const DEMO_ACTIVITIES: any[] = [];

export async function GET() {
  try {
    // TODO: Replace with actual database query when Prisma is ready
    return NextResponse.json({
      success: true,
      data: DEMO_ACTIVITIES,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
