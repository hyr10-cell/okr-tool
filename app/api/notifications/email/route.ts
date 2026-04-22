import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();
    await sendEmail(to, subject, html);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email API error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
