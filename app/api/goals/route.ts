import { NextResponse } from 'next/server';

const DEMO_GOALS = [
  {
    id: '1',
    title: '서비스 성능 개선',
    status: 'ON_TRACK',
    level: 'COMPANY',
    owner: { id: '2', name: '팀장', email: 'manager@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: '웹 응답 속도 50% 개선',
    weight: 30,
    createdAt: new Date(),
    checkIns: [{ progress: 65 }],
  },
  {
    id: '2',
    title: 'API 보안 강화',
    status: 'OFF_TRACK',
    level: 'TEAM',
    owner: { id: '2', name: '팀장', email: 'manager@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: 'OWASP Top 10 취약점 제거',
    weight: 25,
    createdAt: new Date(),
    checkIns: [{ progress: 30 }],
  },
  {
    id: '3',
    title: '코드 리뷰 프로세스 개선',
    status: 'PENDING',
    level: 'TEAM',
    owner: { id: '2', name: '팀장', email: 'manager@example.com' },
    cycle: { id: '1', name: '2024년 Q2' },
    description: '자동 검수 도구 도입',
    weight: 20,
    createdAt: new Date(),
    checkIns: [],
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: DEMO_GOALS });
}

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Demo mode - data not persisted' },
    { status: 201 }
  );
}
