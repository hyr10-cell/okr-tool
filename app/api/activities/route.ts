import { NextResponse } from 'next/server';

const DEMO_ACTIVITIES = [
  {
    id: '1',
    type: 'goal_status',
    title: 'API 보안 강화',
    description: '상태 변경 (순항 → 난항)',
    timestamp: '2024-03-20 14:30',
    goalId: '2',
  },
  {
    id: '2',
    type: 'checkin',
    title: '서비스 성능 개선',
    description: '체크인 제출',
    timestamp: '2024-03-19 10:15',
    goalId: '1',
  },
  {
    id: '3',
    type: 'feedback',
    title: '좋은 진행 방향입니다',
    description: '피드백 수신',
    timestamp: '2024-03-18 09:45',
    goalId: '1',
  },
  {
    id: '4',
    type: 'goal_status',
    title: '마이크로서비스 아키텍처 전환',
    description: '새 목표 생성',
    timestamp: '2024-03-17 16:20',
    goalId: '2',
  },
  {
    id: '5',
    type: 'checkin',
    title: '사용자 경험 개선',
    description: '체크인 제출',
    timestamp: '2024-03-16 11:45',
    goalId: '3',
  },
];

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
