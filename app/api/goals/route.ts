import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
  },
];

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return demo goals if database not available
    if (!prisma) {
      return NextResponse.json({ success: true, data: DEMO_GOALS });
    }

    const goals = await prisma.goal.findMany({
      where: { deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        cycle: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    console.error('목표 조회 실패:', error);
    // Return demo data on error
    return NextResponse.json({ success: true, data: DEMO_GOALS });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!prisma) {
      return NextResponse.json(
        { success: true, message: 'Demo mode - data not persisted' },
        { status: 201 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        cycleId: body.cycleId,
        title: body.title,
        level: body.level,
        ownerUserId: body.ownerUserId,
        ownerDeptId: body.ownerDeptId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        description: body.description,
        createdById: session.user.id,
        status: 'PENDING',
      },
      include: {
        owner: { select: { id: true, name: true } },
        cycle: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    console.error('목표 생성 실패:', error);
    return NextResponse.json(
      { error: '목표 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
