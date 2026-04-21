import { NextResponse } from 'next/server';

const DEMO_FEEDBACKS = [
  {
    id: '1',
    senderId: '2',
    sender: { id: '2', name: '팀장', email: 'manager@example.com' },
    receiverId: '3',
    type: 'KEEP_GOING',
    valueId: null,
    content: '좋은 아이디어 잘 반영했습니다!',
    createdAt: new Date(),
  },
  {
    id: '2',
    senderId: '1',
    sender: { id: '1', name: '관리자', email: 'admin@example.com' },
    receiverId: '3',
    type: 'IMPROVE',
    valueId: null,
    content: '다음엔 더 빠른 진행이 필요합니다.',
    createdAt: new Date(),
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: DEMO_FEEDBACKS });
}

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Demo mode' },
    { status: 201 }
  );
}
