import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { channel, text } = await req.json();

    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    if (!slackBotToken) {
      console.warn('SLACK_BOT_TOKEN not configured');
      return NextResponse.json({ error: 'Slack not configured' }, { status: 400 });
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackBotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack API error:', data.error);
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Slack API error:', err);
    return NextResponse.json({ error: 'Failed to send Slack message' }, { status: 500 });
  }
}
