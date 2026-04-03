import React from 'react';
import { Mail } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { SurveyNotifications, EmailNotificationConfig } from '@/types/survey';

interface EmailNotificationsCardProps {
  notifications?: SurveyNotifications;
  onNotificationsChange: (notifications: SurveyNotifications) => void;
}

const DEFAULT_CONFIG: EmailNotificationConfig = {
  enabled: false,
  to: '',
  subject: '',
  body: '',
  replyTo: '',
  senderName: '',
};

const DEFAULT_NOTIFICATIONS: SurveyNotifications = {
  self: {
    ...DEFAULT_CONFIG,
  },
  respondent: {
    ...DEFAULT_CONFIG,
    to: 'question:q-email',
  },
};

interface NotificationSectionProps {
  idPrefix: string;
  title: string;
  description: string;
  config: EmailNotificationConfig;
  onChange: (updates: Partial<EmailNotificationConfig>) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  idPrefix,
  title,
  description,
  config,
  onChange,
}) => (
  <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={Boolean(config.enabled)}
        onCheckedChange={(checked) => onChange({ enabled: checked })}
      />
    </div>

    {config.enabled && (
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-to`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recipients
          </Label>
          <Input
            id={`${idPrefix}-to`}
            value={config.to || ''}
            onChange={(e) => onChange({ to: e.target.value })}
            placeholder={idPrefix === 'respondent' ? 'question:q-email' : 'ops@example.com, support@example.com'}
            className="rounded-xl border-border/70 bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-subject`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subject
          </Label>
          <Input
            id={`${idPrefix}-subject`}
            value={config.subject || ''}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder="New response from {{question:q-name}}"
            className="rounded-xl border-border/70 bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-body`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Body
          </Label>
          <Textarea
            id={`${idPrefix}-body`}
            value={config.body || ''}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Use {{question:q-name}}, {{hidden:lead_id}}, {{computed:score}}, or @All answers"
            className="min-h-[132px] rounded-xl border-border/70 bg-background"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-reply-to`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Reply-To
            </Label>
            <Input
              id={`${idPrefix}-reply-to`}
              value={config.replyTo || ''}
              onChange={(e) => onChange({ replyTo: e.target.value })}
              placeholder="question:q-email"
              className="rounded-xl border-border/70 bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-sender-name`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Sender Name
            </Label>
            <Input
              id={`${idPrefix}-sender-name`}
              value={config.senderName || ''}
              onChange={(e) => onChange({ senderName: e.target.value })}
              placeholder="Survey Ops"
              className="rounded-xl border-border/70 bg-background"
            />
          </div>
        </div>
      </div>
    )}
  </div>
);

export const EmailNotificationsCard: React.FC<EmailNotificationsCardProps> = ({
  notifications,
  onNotificationsChange,
}) => {
  const mergedNotifications: SurveyNotifications = {
    ...DEFAULT_NOTIFICATIONS,
    ...notifications,
    self: {
      ...DEFAULT_NOTIFICATIONS.self,
      ...notifications?.self,
    },
    respondent: {
      ...DEFAULT_NOTIFICATIONS.respondent,
      ...notifications?.respondent,
    },
  };

  const updateSection = (section: 'self' | 'respondent', updates: Partial<EmailNotificationConfig>) => {
    onNotificationsChange({
      ...mergedNotifications,
      [section]: {
        ...mergedNotifications[section],
        ...updates,
      },
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <Mail className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Email Notifications
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Send owner and respondent emails using answer, hidden, and computed field placeholders.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-2">
        <NotificationSection
          idPrefix="owner"
          title="Owner Notification"
          description="Send internal notifications when a response is submitted."
          config={mergedNotifications.self || DEFAULT_CONFIG}
          onChange={(updates) => updateSection('self', updates)}
        />

        <NotificationSection
          idPrefix="respondent"
          title="Respondent Notification"
          description="Send a follow-up email back to the respondent using a field reference."
          config={mergedNotifications.respondent || DEFAULT_CONFIG}
          onChange={(updates) => updateSection('respondent', updates)}
        />
      </div>
    </section>
  );
};
