import { sendTransactionalEmail } from '../mailer.js';
import {
  renderNotificationHtml,
  renderNotificationTemplate,
  resolveNotificationRecipients,
  type NotificationTemplateContext,
} from './notification-templates.js';

type JsonRecord = Record<string, unknown>;

interface NotificationConfig {
  enabled?: boolean;
  to?: string;
  subject?: string;
  body?: string;
  replyTo?: string;
  senderName?: string;
}

interface NotificationsContainer {
  self?: NotificationConfig;
  respondent?: NotificationConfig;
}

interface SurveyWithNotifications {
  notifications?: unknown;
  questions?: unknown;
  name?: string;
  title?: string;
}

interface SubmittedSurveyResponse {
  id?: string;
  status?: string | null;
  participantId?: string | null;
  participantEmail?: string | null;
  answers?: unknown;
  metadata?: unknown;
}

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const getNotifications = (survey: SurveyWithNotifications): NotificationsContainer | undefined => (
  isJsonRecord(survey.notifications)
    ? survey.notifications as NotificationsContainer
    : undefined
);

const dispatchNotification = async (
  config: NotificationConfig | undefined,
  context: NotificationTemplateContext,
) => {
  if (!config?.enabled) {
    return;
  }

  const recipients = resolveNotificationRecipients(config.to, context);
  if (recipients.length === 0) {
    return;
  }

  const subject = renderNotificationTemplate(config.subject || 'New form response', context).trim();
  const text = renderNotificationTemplate(config.body || '@All answers', context).trim();
  const replyTo = renderNotificationTemplate(config.replyTo, context).trim();
  const senderName = renderNotificationTemplate(config.senderName, context).trim();

  await sendTransactionalEmail({
    to: recipients,
    subject: subject || 'New form response',
    text: text || 'A new response was submitted.',
    html: renderNotificationHtml(text || 'A new response was submitted.'),
    replyTo: replyTo || undefined,
    senderName: senderName || undefined,
  });
};

export const sendSurveyNotifications = async ({
  survey,
  response,
}: {
  survey: SurveyWithNotifications;
  response: SubmittedSurveyResponse;
}) => {
  if (response.status !== 'submitted') {
    return;
  }

  const notifications = getNotifications(survey);
  if (!notifications) {
    return;
  }

  const context: NotificationTemplateContext = {
    survey,
    response,
  };

  await dispatchNotification(notifications.self, context);
  await dispatchNotification(notifications.respondent, context);
};
