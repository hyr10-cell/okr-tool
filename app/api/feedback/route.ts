import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json();

    // 클라이언트에서 받은 이메일 정보 사용
    const recipients: string[] = [];

    if (feedback.fromEmail) {
      recipients.push(feedback.fromEmail);
    }

    if (feedback.recipientEmail) {
      recipients.push(feedback.recipientEmail);
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'feedback_created',
        actor: { name: feedback.from || '나', email: feedback.fromEmail || '' },
        recipients: [...new Set(recipients)],
        target: { title: feedback.recipient || '피드백', id: feedback.id, type: 'feedback' },
      });
    }

    return NextResponse.json(
      { success: true, message: 'Feedback created', data: feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create feedback' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const feedback = await request.json();

    // 클라이언트에서 받은 이메일 정보 사용
    const recipients: string[] = [];

    if (feedback.fromEmail) {
      recipients.push(feedback.fromEmail);
    }

    if (feedback.recipientEmail) {
      recipients.push(feedback.recipientEmail);
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'feedback_updated',
        actor: { name: feedback.from || '나', email: feedback.fromEmail || '' },
        recipients: [...new Set(recipients)],
        target: { title: feedback.recipient || '피드백', id: feedback.id, type: 'feedback' },
      });
    }

    return NextResponse.json(
      { success: true, message: 'Feedback updated', data: feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error('Feedback update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 400 }
    );
  }
}
