export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
}

export async function sendSlackMessage(message: SlackMessage) {
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.error('Slack bot token not configured');
      return;
    }

    console.log('Sending Slack message to channel:', message.channel);

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: message.channel,
        text: message.text,
        blocks: message.blocks,
      }),
    });

    const result = await response.json();
    console.log('Slack API response:', result);

    if (!result.ok) {
      console.error('Slack message send failed:', result.error);
    } else {
      console.log('Slack message sent successfully');
    }
  } catch (error) {
    console.error('Slack message send error:', error);
  }
}

export function formatSlackMessage(type: string, actor: string, target: string): SlackMessage {
  const emoji = {
    goal_created: '🎯',
    goal_updated: '📝',
    goal_deleted: '🗑️',
    feedback_created: '💬',
    feedback_updated: '📢',
    feedback_deleted: '❌',
    checkin_submitted: '✅',
    comment_added: '💭',
  }[type] || '📌';

  const typeLabel = {
    goal_created: '새 목표 생성',
    goal_updated: '목표 수정',
    goal_deleted: '목표 삭제',
    feedback_created: '새 피드백',
    feedback_updated: '피드백 수정',
    feedback_deleted: '피드백 삭제',
    checkin_submitted: '체크인 제출',
    comment_added: '새 댓글',
  }[type] || '활동';

  return {
    channel: 'D0AVC2L6KEV',
    text: `${emoji} ${typeLabel} by ${actor}: ${target}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${typeLabel}*\n*담당자:* ${actor}\n*대상:* ${target}`,
        },
      },
    ],
  };
}
