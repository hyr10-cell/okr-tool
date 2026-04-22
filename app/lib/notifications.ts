import { sendEmail } from './email';

export type NotificationType =
  | 'goal_created'
  | 'goal_updated'
  | 'goal_deleted'
  | 'feedback_created'
  | 'feedback_updated'
  | 'feedback_deleted'
  | 'checkin_submitted'
  | 'comment_added';

export interface NotificationPayload {
  type: NotificationType;
  actor: { name: string; email: string };
  recipients: string[]; // 이메일 주소 배열
  target: { title: string; id: string; type: 'goal' | 'feedback' | 'checkin' | 'comment' };
  details?: any;
}

export async function sendNotification(payload: NotificationPayload) {
  await sendEmailNotification(payload);
}

async function sendEmailNotification(payload: NotificationPayload) {
  const templates: Record<NotificationType, (p: NotificationPayload) => { subject: string; html: string }> = {
    goal_created: (p) => ({
      subject: `[OKR] 새 목표 생성: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 새로운 목표를 생성했습니다</h2><p><strong>${p.target.title}</strong></p><p>시스템에서 확인하세요.</p>`,
    }),
    goal_updated: (p) => ({
      subject: `[OKR] 목표 수정: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 목표를 수정했습니다</h2><p><strong>${p.target.title}</strong></p><p>변경사항을 확인하세요.</p>`,
    }),
    goal_deleted: (p) => ({
      subject: `[OKR] 목표 삭제: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 목표를 삭제했습니다</h2><p><strong>${p.target.title}</strong></p>`,
    }),
    feedback_created: (p) => ({
      subject: `[OKR] 새 피드백 받음: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 피드백을 작성했습니다</h2><p><strong>${p.target.title}</strong></p><p>피드백을 확인하세요.</p>`,
    }),
    feedback_updated: (p) => ({
      subject: `[OKR] 피드백 수정: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 피드백을 수정했습니다</h2><p><strong>${p.target.title}</strong></p>`,
    }),
    feedback_deleted: (p) => ({
      subject: `[OKR] 피드백 삭제: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 피드백을 삭제했습니다</h2><p><strong>${p.target.title}</strong></p>`,
    }),
    checkin_submitted: (p) => ({
      subject: `[OKR] 체크인 제출: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 체크인을 제출했습니다</h2><p><strong>${p.target.title}</strong></p><p>진행상황을 확인하세요.</p>`,
    }),
    comment_added: (p) => ({
      subject: `[OKR] 새 댓글: ${p.target.title}`,
      html: `<h2>${p.actor.name}님이 댓글을 달았습니다</h2><p><strong>${p.target.title}</strong></p><p>댓글을 확인하세요.</p>`,
    }),
  };

  const template = templates[payload.type](payload);

  // 각 수신자에게 이메일 발송
  for (const recipientEmail of payload.recipients) {
    await sendEmail(recipientEmail, template.subject, template.html);
  }
}
