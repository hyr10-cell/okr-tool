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
    return NextResponse.json({ success: true, data: DEMO_CYCLES });
  } catch (error) {
    console.error('사이클 조회 실패:', error);
    return NextResponse.json({ success: true, data: DEMO_CYCLES });
  }
}

export async function POST() {
  try {
    return NextResponse.json(
      { success: true, message: 'Demo mode' },
      { status: 201 }
    );
  } catch (error) {
    console.error('사이클 생성 실패:', error);
    return NextResponse.json(
      { error: '사이클 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
