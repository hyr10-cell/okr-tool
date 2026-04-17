import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
