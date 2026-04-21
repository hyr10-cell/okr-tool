import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { progress, status, note } = body;

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
