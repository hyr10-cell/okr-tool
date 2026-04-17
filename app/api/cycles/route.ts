import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DEMO_CYCLES = [
  {
    id: '1',
    name: '2024년 Q2',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-30'),
    restrictPeriod: false,
    allowApproval: true,
    isReadOnly: false,
    checkinAlertOn: true,
  },
  {
    id: '2',
    name: '2024년 Q1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    restrictPeriod: false,
    allowApproval: true,
    isReadOnly: true,
    checkinAlertOn: true,
  },
];

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ success: true, data: DEMO_CYCLES });
    }

    const cycles = await prisma.goalCycle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: cycles });
  } catch (error) {
    console.error('사이클 조회 실패:', error);
    return NextResponse.json({ success: true, data: DEMO_CYCLES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!prisma) {
      return NextResponse.json(
        { success: true, message: 'Demo mode' },
        { status: 201 }
      );
    }

    const cycle = await prisma.goalCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ success: true, data: cycle }, { status: 201 });
  } catch (error) {
    console.error('사이클 생성 실패:', error);
    return NextResponse.json(
      { error: '사이클 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
