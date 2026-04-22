import { NextResponse } from 'next/server';

const DEMO_ORGS: any[] = [];

export async function GET() {
  try {
    // TODO: Replace with actual database query when Prisma is ready
    return NextResponse.json({
      success: true,
      data: DEMO_ORGS,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Add organization to database
    const newOrg = {
      id: Date.now().toString(),
      name: body.name,
      lead: body.lead,
      members: [],
      children: [],
    };
    return NextResponse.json({ success: true, data: newOrg });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
