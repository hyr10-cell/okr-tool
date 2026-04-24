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

export function formatSlackMessage(type: string, actor: string, details: any): SlackMessage {
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

  let contentText = '';

  switch(type) {
    case 'goal_created':
      contentText = `*목표:* ${details.goalTitle}`;
      break;
    case 'goal_updated':
      contentText = `*목표:* ${details.goalTitle}\n*변경사항:* ${details.changes || '목표 정보 수정됨'}`;
      break;
    case 'goal_deleted':
      contentText = `*삭제된 목표:* ${details.goalTitle}`;
      break;
    case 'checkin_submitted':
      contentText = `*목표:* ${details.goalTitle}\n*진행률:* ${details.progress}%\n*상태:* ${details.status}\n${details.note ? `*내용:* ${details.note}` : ''}`;
      break;
    case 'comment_added':
      contentText = `*목표:* ${details.goalTitle}\n*댓글:* ${details.commentContent}`;
      break;
    case 'feedback_created':
    case 'feedback_updated':
      contentText = `*${details.from}* → *${details.recipient}*\n*유형:* ${details.feedbackType === 'KEEP_GOING' ? '좋은 점 👍' : '개선점 🔧'}\n*내용:* ${details.content}`;
      break;
    default:
      contentText = `*대상:* ${details.target}`;
  }

  return {
    channel: 'D0AVC2L6KEV',
    text: `${emoji} ${typeLabel} by ${actor}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${typeLabel}* by ${actor}\n${contentText}`,
        },
      },
    ],
  };
}
