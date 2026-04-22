import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json();

    // 피드백을 받는 사람과 보낸 사람의 이메일 수집
    const recipients: string[] = [];

    // 보낸 사람(from)의 이메일
    if (feedback.from) {
      // localStorage에서 구성원 정보 조회
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      const fromMember = members.find(m => m.name === feedback.from);
      if (fromMember?.email) {
        recipients.push(fromMember.email);
      }
    }

    // 받는 사람(recipient)의 이메일
    if (feedback.recipient) {
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      const toMember = members.find(m => m.name === feedback.recipient);
      if (toMember?.email) {
        recipients.push(toMember.email);
      }
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'feedback_created',
        actor: { name: feedback.from || '나', email: '' },
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

    // 피드백을 받는 사람과 보낸 사람의 이메일 수집
    const recipients: string[] = [];

    if (feedback.from) {
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      const fromMember = members.find(m => m.name === feedback.from);
      if (fromMember?.email) {
        recipients.push(fromMember.email);
      }
    }

    if (feedback.recipient) {
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      const toMember = members.find(m => m.name === feedback.recipient);
      if (toMember?.email) {
        recipients.push(toMember.email);
      }
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'feedback_updated',
        actor: { name: feedback.from || '나', email: '' },
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
