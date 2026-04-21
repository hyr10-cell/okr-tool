import { NextResponse, NextRequest } from 'next/server';

const DEMO_GOALS = [
  {
    id: '1',
    title: '서비스 성능 개선',
    status: 'ON_TRACK',
    level: 'COMPANY',
    owner: { id: '1', name: '황유리', email: 'hyr@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: '웹 응답 속도 50% 개선',
    weight: 30,
    createdAt: new Date(),
    checkIns: [{ progress: 65 }],
    sharedWith: ['고종희'],
  },
  {
    id: '2',
    title: 'API 보안 강화',
    status: 'OFF_TRACK',
    level: 'TEAM',
    owner: { id: '2', name: '고종희', email: 'kjh@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: 'OWASP Top 10 취약점 제거',
    weight: 25,
    createdAt: new Date(),
    checkIns: [{ progress: 30 }],
    sharedWith: ['황유리'],
  },
  {
    id: '3',
    title: '코드 리뷰 프로세스 개선',
    status: 'PENDING',
    level: 'TEAM',
    owner: { id: '1', name: '황유리', email: 'hyr@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: '자동 검수 도구 도입',
    weight: 20,
    createdAt: new Date(),
    checkIns: [],
    sharedWith: [],
  },
];

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get('user');

  let goals = DEMO_GOALS;
  if (user) {
    goals = DEMO_GOALS.filter(goal =>
      goal.owner.name === user || (goal.sharedWith && goal.sharedWith.includes(user))
    );
  }

  return NextResponse.json({ success: true, data: goals });
}

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Demo mode - data not persisted' },
    { status: 201 }
  );
}
