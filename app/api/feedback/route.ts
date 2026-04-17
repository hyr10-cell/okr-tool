import { prisma } from '@/lib/prisma';
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');

    if (!prisma) {
      return NextResponse.json({ success: true, data: DEMO_FEEDBACKS });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: receiverId ? { receiverId } : {},
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('피드백 조회 실패:', error);
    return NextResponse.json({ success: true, data: DEMO_FEEDBACKS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, type, content } = body;

    if (!prisma) {
      return NextResponse.json(
        { success: true, message: 'Demo mode' },
        { status: 201 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        senderId,
        receiverId,
        type,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('피드백 작성 실패:', error);
    return NextResponse.json(
      { error: '피드백 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
