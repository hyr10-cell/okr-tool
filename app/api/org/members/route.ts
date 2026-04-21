import { NextResponse } from 'next/server';

const DEMO_MEMBERS = [
  { id: '1', name: '관리자', email: 'admin@example.com', role: 'ADMIN', org: '개발팀' },
  { id: '2', name: '팀장', email: 'manager@example.com', role: 'MANAGER', org: '개발팀' },
  { id: '3', name: '팀원', email: 'member@example.com', role: 'MEMBER', org: '개발팀' },
  { id: '4', name: '개발자A', email: 'devA@example.com', role: 'MEMBER', org: '백엔드팀' },
  { id: '5', name: '개발자B', email: 'devB@example.com', role: 'MEMBER', org: '프론트엔드팀' },
];

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
