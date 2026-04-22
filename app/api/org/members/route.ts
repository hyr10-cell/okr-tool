import { NextResponse } from 'next/server';

const DEMO_MEMBERS: any[] = [];

export async function GET() {
  try {
    // TODO: Replace with actual database query when Prisma is ready
    return NextResponse.json({
      success: true,
      data: DEMO_MEMBERS,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Add member to database
    const newMember = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      role: body.role,
      org: body.org,
    };
    return NextResponse.json({ success: true, data: newMember });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
