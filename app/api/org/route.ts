import { NextResponse } from 'next/server';

const DEMO_ORGS = [
  {
    id: '1',
    name: '개발팀',
    lead: '김개발',
    members: [
      { id: 'm1', name: '팀원1', role: 'Developer', org: '개발팀' },
      { id: 'm2', name: '팀원2', role: 'Developer', org: '개발팀' },
    ],
    children: [
      {
        id: '1-1',
        name: '백엔드팀',
        lead: '이백엔드',
        parentId: '1',
        members: [
          { id: 'm3', name: '개발자A', role: 'Backend Developer', org: '백엔드팀' },
        ],
      },
      {
        id: '1-2',
        name: '프론트엔드팀',
        lead: '박프론트',
        parentId: '1',
        members: [
          { id: 'm4', name: '개발자B', role: 'Frontend Developer', org: '프론트엔드팀' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: '마케팅팀',
    lead: undefined,
    members: [],
    children: [],
  },
];

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
