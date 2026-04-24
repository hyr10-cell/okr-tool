import { NextResponse, NextRequest } from 'next/server';
import { sendNotification } from '@/app/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkinId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { content, goal } = body;

    // 담당자와 리뷰어의 이메일 수집
    const recipients: string[] = [];

    if (goal) {
      // 담당자(owner)의 이메일
      const ownerEmail = goal.owner?.email;

      if (ownerEmail) {
        recipients.push(ownerEmail);
      }

      // 리뷰어(sharedWith)의 이메일 - 나중에 DB 구현 시 추가

      // 알림 발송
      if (recipients.length > 0) {
        await sendNotification({
          type: 'comment_added',
          actor: { name: '사용자', email: '' },
          recipients: [...new Set(recipients)],
          target: { title: goal.title || '목표', id: resolvedParams.id, type: 'comment' },
          details: {
            goalTitle: goal.title || '목표',
            commentContent: content,
          },
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
          checkinId: resolvedParams.checkinId,
          content,
          author: { name: '나' },
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('코멘트 등록 실패:', error);
    return NextResponse.json(
      { error: '코멘트 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
