import { NextRequest, NextResponse } from 'next/server';

// Demo data
const DEMO_GOALS = [
  {
    id: '1',
    title: '서비스 성능 개선',
    description: '프로덕션 환경의 보안 취약점 해결',
    status: 'ON_TRACK',
    level: 'COMPANY',
    owner: { name: '황유리' },
    cycle: { name: '2024 Q2' },
    checkIns: [
      {
        id: 'c1',
        progress: 65,
        status: 'ON_TRACK',
        note: '현재 성능 개선이 진행 중입니다.',
        createdAt: '2024-04-20T10:00:00Z',
        comments: [
          {
            id: 'cm1',
            content: '좋은 진행입니다!',
            author: { name: '고종희' },
            createdAt: '2024-04-20T11:00:00Z',
          },
        ],
      },
    ],
    sharedWith: ['고종희'],
  },
  {
    id: '2',
    title: 'API 보안 강화',
    description: '모놀리식 구조를 마이크로서비스로 전환',
    status: 'OFF_TRACK',
    level: 'TEAM',
    owner: { name: '고종희' },
    cycle: { name: '2024 Q2' },
    checkIns: [
      {
        id: 'c2',
        progress: 30,
        status: 'OFF_TRACK',
        note: '예상보다 디자인 피드백이 많아서 진도가 늦어지고 있습니다.',
        createdAt: '2024-04-19T14:30:00Z',
        comments: [],
      },
    ],
    sharedWith: ['황유리'],
  },
  {
    id: '3',
    title: '코드 리뷰 프로세스 개선',
    description: 'UI/UX 개선 및 성능 최적화',
    status: 'PENDING',
    level: 'TEAM',
    owner: { name: '황유리' },
    cycle: { name: '2024 Q2' },
    checkIns: [],
    sharedWith: [],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const goal = DEMO_GOALS.find((g) => g.id === resolvedParams.id);

    if (!goal) {
      return NextResponse.json(
        { error: '목표를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: '목표 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
