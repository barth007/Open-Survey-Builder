import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/mailer.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

import { sendTransactionalEmail } from '../src/mailer.js';
import { sendSurveyNotifications } from '../src/lib/survey-notifications.js';

const survey = {
  id: 'survey-1',
  name: 'Hiring Pipeline',
  questions: [
    {
      id: 'q-name',
      type: 'text',
      text: 'Full name',
      options: [],
    },
    {
      id: 'q-email',
      type: 'text',
      blockType: 'email',
      text: 'Email',
      options: [],
    },
    {
      id: 'q-role',
      type: 'multipleChoice',
      text: 'Role',
      options: [
        { id: 'designer', text: 'Designer' },
        { id: 'engineer', text: 'Engineer' },
      ],
    },
  ],
  notifications: {
    self: {
      enabled: true,
      to: 'ops@example.com',
      subject: 'New candidate: {{question:q-name}}',
      body: 'Role: {{question:q-role}}\n\n@All answers',
      replyTo: '{{question:q-email}}',
      senderName: 'Hiring Bot',
    },
    respondent: {
      enabled: true,
      to: 'question:q-email',
      subject: 'Thanks {{question:q-name}}',
      body: 'We received your application for {{question:q-role}}.',
    },
  },
};

const submittedResponse = {
  id: 'response-1',
  surveyId: survey.id,
  status: 'submitted',
  participantEmail: null,
  answers: [
    { questionId: 'q-name', value: 'Ada Lovelace' },
    { questionId: 'q-email', value: 'ada@example.com' },
    { questionId: 'q-role', value: 'designer' },
  ],
  metadata: {
    hiddenFields: {
      lead_id: 'lead-42',
    },
    computedFields: {
      score: 97,
    },
  },
};

describe('survey notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dynamic owner and respondent notifications for submitted responses only', async () => {
    await sendSurveyNotifications({
      survey,
      response: submittedResponse,
    });

    expect(vi.mocked(sendTransactionalEmail)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(sendTransactionalEmail)).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: ['ops@example.com'],
        subject: 'New candidate: Ada Lovelace',
        replyTo: 'ada@example.com',
        senderName: 'Hiring Bot',
      }),
    );
    expect(vi.mocked(sendTransactionalEmail).mock.calls[0]?.[0].html).toContain('Role: Designer');
    expect(vi.mocked(sendTransactionalEmail).mock.calls[0]?.[0].text).toContain('Full name: Ada Lovelace');

    expect(vi.mocked(sendTransactionalEmail)).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: ['ada@example.com'],
        subject: 'Thanks Ada Lovelace',
      }),
    );
  });

  it('skips notifications for non-submitted response states', async () => {
    await sendSurveyNotifications({
      survey,
      response: {
        ...submittedResponse,
        status: 'partial',
      },
    });

    expect(vi.mocked(sendTransactionalEmail)).not.toHaveBeenCalled();
  });
});
