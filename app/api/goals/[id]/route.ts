import { NextRequest, NextResponse } from 'next/server';

// Demo data
const DEMO_GOALS = [
  {
    id: '1',
    title: 'API 보안 강화',
    description: '프로덕션 환경의 보안 취약점 해결',
    status: 'ON_TRACK',
    level: 'TEAM',
    owner: { name: '김개발' },
    cycle: { name: '2024 Q2' },
    checkIns: [
      {
        id: 'c1',
        progress: 65,
        status: 'ON_TRACK',
        note: '현재 API 엔드포인트의 50%를 보안 검토 완료했습니다.',
        createdAt: '2024-04-20T10:00:00Z',
        comments: [
          {
            id: 'cm1',
            content: '좋은 진행입니다!',
            author: { name: '팀장' },
            createdAt: '2024-04-20T11:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: '마이크로서비스 아키텍처 전환',
    description: '모놀리식 구조를 마이크로서비스로 전환',
    status: 'PENDING',
    level: 'COMPANY',
    owner: { name: '이백엔드' },
    cycle: { name: '2024 Q2' },
    checkIns: [],
  },
  {
    id: '3',
    title: '사용자 경험 개선',
    description: 'UI/UX 개선 및 성능 최적화',
    status: 'OFF_TRACK',
    level: 'TEAM',
    owner: { name: '박프론트' },
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
