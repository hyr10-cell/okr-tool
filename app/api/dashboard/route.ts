import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  // 내가 리뷰어인 담당자 목록
  const reviewees = await prisma.user.findMany({
    where: { reviewerId: session.user.id },
    select: {
      id: true, name: true, email: true,
      goals: {
        where: { deletedAt: null },
        include: {
          checkIns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  return NextResponse.json({ data: reviewees });
}
