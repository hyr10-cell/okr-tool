import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; checkinId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { content } = body;

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
