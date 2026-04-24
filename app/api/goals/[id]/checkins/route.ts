import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { progress, status, note } = body;

    // localStorage에서 목표 정보 조회
    let goal = null;
    try {
      const userGoalsStr = typeof window !== 'undefined' ? localStorage.getItem('userGoals') : null;
      const userGoals = userGoalsStr ? JSON.parse(userGoalsStr) : [];
      goal = userGoals.find((g: any) => g.id === resolvedParams.id);
      console.log('Found goal:', goal ? { id: goal.id, title: goal.title, ownerEmail: goal.owner?.email } : 'NOT FOUND');
    } catch (e) {
      console.error('Failed to parse goals:', e);
    }

    // 담당자와 리뷰어의 이메일 수집
    const recipients: string[] = [];

    if (goal) {
      // 담당자(owner)의 이메일
      if (goal.owner?.email) {
        recipients.push(goal.owner.email);
      }
      console.log('Checkin recipients:', recipients.length);

      // 리뷰어(sharedWith)의 이메일
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
          type: 'checkin_submitted',
          actor: { name: goal.owner?.name || '나', email: goal.owner?.email || '' },
          recipients: [...new Set(recipients)],
          target: { title: goal.title || '목표', id: resolvedParams.id, type: 'checkin' },
        });
      }
    }

    // Demo: Just return success (JAY will implement actual DB logic)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: Date.now().toString(),
          goalId: resolvedParams.id,
          progress,
          status,
          note,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('체크인 제출 실패:', error);
    return NextResponse.json(
      { error: '체크인 제출에 실패했습니다.' },
      { status: 500 }
    );
  }
}
