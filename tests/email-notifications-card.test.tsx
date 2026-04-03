import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EmailNotificationsCard } from '@/features/survey-editor/components/EmailNotificationsCard';

describe('email notifications card', () => {
  it('renders both owner and respondent notification sections with persisted templates', () => {
    const html = renderToStaticMarkup(
      <EmailNotificationsCard
        notifications={{
          self: {
            enabled: true,
            to: 'ops@example.com, sales@example.com',
            subject: 'New lead {{question:q-name}}',
            body: 'Lead source {{hidden:lead_id}}',
            replyTo: 'question:q-email',
            senderName: 'Ops Bot',
          },
          respondent: {
            enabled: true,
            to: 'question:q-email',
            subject: 'Thanks {{question:q-name}}',
            body: 'Score {{computed:score}}',
          },
        }}
        onNotificationsChange={() => {}}
      />,
    );

    expect(html).toContain('Email Notifications');
    expect(html).toContain('Owner Notification');
    expect(html).toContain('Respondent Notification');
    expect(html).toContain('ops@example.com, sales@example.com');
    expect(html).toContain('New lead {{question:q-name}}');
    expect(html).toContain('Score {{computed:score}}');
  });
});
