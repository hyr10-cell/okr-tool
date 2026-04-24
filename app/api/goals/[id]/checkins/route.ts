import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { progress, status, note, goal } = body;

    console.log('Found goal:', goal ? { id: goal.id, title: goal.title, ownerEmail: goal.owner?.email } : 'NOT FOUND');

    // 담당자와 리뷰어의 이메일 수집
    const recipients: string[] = [];

    if (goal) {
      // 담당자(owner)의 이메일
      const ownerEmail = goal.owner?.email;

      if (ownerEmail) {
        recipients.push(ownerEmail);
      }
      console.log('Checkin recipients:', recipients.length);

      // 리뷰어(sharedWith)의 이메일
      if (goal.sharedWith && goal.sharedWith.length > 0) {
        for (const reviewerName of goal.sharedWith) {
          // 클라이언트에서 전달된 goal에 reviewers 정보가 있으면 사용
          // 아니면 이름으로 표기만 하고 실제 알림은 owner에게만
          if (reviewerName && typeof reviewerName === 'string') {
            // 나중에 구성원 DB가 있으면 여기서 이메일 조회
            // 지금은 owner만 알림 받음
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
