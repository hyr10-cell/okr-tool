import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: NextRequest) {
  try {
    const goal = await request.json();

    // 담당자와 리뷰어의 이메일 수집
    const recipients: string[] = [];

    // 담당자(owner)의 이메일
    if (goal.owner?.email) {
      recipients.push(goal.owner.email);
    }

    // 리뷰어(sharedWith)의 이메일 - 구성원 정보에서 조회
    if (goal.sharedWith && goal.sharedWith.length > 0) {
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      for (const reviewer of goal.sharedWith) {
        const member = members.find(m => m.name === reviewer);
        if (member?.email) {
          recipients.push(member.email);
        }
      }
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'goal_created',
        actor: { name: goal.owner?.name || '나', email: goal.owner?.email || '' },
        recipients: [...new Set(recipients)], // 중복 제거
        target: { title: goal.title, id: goal.id, type: 'goal' },
        details: {
          goalTitle: goal.title,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: 'Goal created', data: goal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Goal creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const goal = await request.json();

    // 담당자와 리뷰어의 이메일 수집
    const recipients: string[] = [];

    if (goal.owner?.email) {
      recipients.push(goal.owner.email);
    }

    if (goal.sharedWith && goal.sharedWith.length > 0) {
      const userMembersStr = typeof window !== 'undefined' ? localStorage.getItem('userMembers') : null;
      let members: any[] = [];

      try {
        members = userMembersStr ? JSON.parse(userMembersStr) : [];
      } catch (e) {
        console.error('Failed to parse members:', e);
      }

      for (const reviewer of goal.sharedWith) {
        const member = members.find(m => m.name === reviewer);
        if (member?.email) {
          recipients.push(member.email);
        }
      }
    }

    // 알림 발송
    if (recipients.length > 0) {
      await sendNotification({
        type: 'goal_updated',
        actor: { name: goal.owner?.name || '나', email: goal.owner?.email || '' },
        recipients: [...new Set(recipients)],
        target: { title: goal.title, id: goal.id, type: 'goal' },
        details: {
          goalTitle: goal.title,
          changes: goal.description ? '목표 정보 수정됨' : '목표 수정됨',
        },
      });
    }

    return NextResponse.json(
      { success: true, message: 'Goal updated', data: goal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Goal update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update goal' },
      { status: 400 }
    );
  }
}
