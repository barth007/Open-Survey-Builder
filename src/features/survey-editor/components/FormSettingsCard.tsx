import React from 'react';
import { Settings2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { SurveySettings } from '@/types/survey';

interface FormSettingsCardProps {
  settings?: SurveySettings;
  onSettingsChange: (settings: SurveySettings) => void;
}

const DEFAULT_SETTINGS: SurveySettings = {
  locale: 'en',
  completion: {
    redirectUrl: '',
  },
  access: {
    isClosed: false,
    closeAt: '',
    maxSubmissions: undefined,
    closedMessage: {
      title: '',
      description: '',
    },
    passwordProtection: {
      enabled: false,
      password: '',
      hasPassword: false,
    },
    duplicateProtection: {
      enabled: false,
      uniqueFieldRef: '',
      appliesTo: 'submitted',
    },
  },
  behavior: {
    autoJumpSingleQuestionPages: false,
    saveLocalDraft: false,
    capturePartialSubmissions: false,
  },
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
    {children}
  </p>
);

const ToggleRow: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}> = ({ title, description, checked, onCheckedChange, children }) => (
  <div className="rounded-2xl border border-border/70 bg-muted/[0.06] px-4 py-3 transition-colors hover:bg-muted/[0.12]">
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export const FormSettingsCard: React.FC<FormSettingsCardProps> = ({
  settings,
  onSettingsChange,
}) => {
  const mergedSettings: SurveySettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    completion: {
      ...DEFAULT_SETTINGS.completion,
      ...settings?.completion,
    },
    access: {
      ...DEFAULT_SETTINGS.access,
      ...settings?.access,
      closedMessage: {
        ...DEFAULT_SETTINGS.access?.closedMessage,
        ...settings?.access?.closedMessage,
      },
      passwordProtection: {
        ...DEFAULT_SETTINGS.access?.passwordProtection,
        ...settings?.access?.passwordProtection,
      },
      duplicateProtection: {
        ...DEFAULT_SETTINGS.access?.duplicateProtection,
        ...settings?.access?.duplicateProtection,
      },
    },
    behavior: {
      ...DEFAULT_SETTINGS.behavior,
      ...settings?.behavior,
    },
  };

  const updateSettings = (updates: Partial<SurveySettings>) => {
    onSettingsChange({ ...mergedSettings, ...updates });
  };

  const updateCompletion = (updates: Partial<NonNullable<SurveySettings['completion']>>) => {
    updateSettings({ completion: { ...mergedSettings.completion, ...updates } });
  };

  const updateAccess = (updates: Partial<NonNullable<SurveySettings['access']>>) => {
    updateSettings({ access: { ...mergedSettings.access, ...updates } });
  };

  const updateClosedMessage = (updates: Partial<NonNullable<NonNullable<SurveySettings['access']>['closedMessage']>>) => {
    updateAccess({ closedMessage: { ...mergedSettings.access?.closedMessage, ...updates } });
  };

  const updateBehavior = (updates: Partial<NonNullable<SurveySettings['behavior']>>) => {
    updateSettings({ behavior: { ...mergedSettings.behavior, ...updates } });
  };

  const updatePasswordProtection = (updates: Partial<NonNullable<NonNullable<SurveySettings['access']>['passwordProtection']>>) => {
    updateAccess({ passwordProtection: { ...mergedSettings.access?.passwordProtection, ...updates } });
  };

  const updateDuplicateProtection = (updates: Partial<NonNullable<NonNullable<SurveySettings['access']>['duplicateProtection']>>) => {
    updateAccess({ duplicateProtection: { ...mergedSettings.access?.duplicateProtection, ...updates } });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
          <Settings2 className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Form Settings
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Runtime behavior, close rules, completion redirect, and save preferences.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/40 px-6 sm:px-8">

        {/* General */}
        <div className="space-y-4 py-7">
          <SectionLabel>General</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="survey-locale" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Locale
              </Label>
              <Input
                id="survey-locale"
                value={mergedSettings.locale || ''}
                onChange={(e) => updateSettings({ locale: e.target.value })}
                placeholder="en"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="survey-completion-redirect" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Completion Redirect
              </Label>
              <Input
                id="survey-completion-redirect"
                value={mergedSettings.completion?.redirectUrl || ''}
                onChange={(e) => updateCompletion({ redirectUrl: e.target.value })}
                placeholder="https://example.com/thanks"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>
        </div>

        {/* Access */}
        <div className="space-y-4 py-7">
          <SectionLabel>Access</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleRow
              title="Close Form"
              description="Manually stop new responses."
              checked={Boolean(mergedSettings.access?.isClosed)}
              onCheckedChange={(checked) => updateAccess({ isClosed: checked })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="survey-close-at" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Auto-Close At
              </Label>
              <Input
                id="survey-close-at"
                type="datetime-local"
                value={mergedSettings.access?.closeAt ? mergedSettings.access.closeAt.slice(0, 16) : ''}
                onChange={(e) => updateAccess({ closeAt: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="survey-max-submissions" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Max Submissions
              </Label>
              <Input
                id="survey-max-submissions"
                type="number"
                value={mergedSettings.access?.maxSubmissions ?? ''}
                onChange={(e) => updateAccess({ maxSubmissions: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="No cap"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>
        </div>

        {/* Closed State */}
        <div className="space-y-4 py-7">
          <SectionLabel>Closed State Message</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="survey-closed-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Title
              </Label>
              <Input
                id="survey-closed-title"
                value={mergedSettings.access?.closedMessage?.title || ''}
                onChange={(e) => updateClosedMessage({ title: e.target.value })}
                placeholder="This form is closed"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="survey-closed-description" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="survey-closed-description"
                value={mergedSettings.access?.closedMessage?.description || ''}
                onChange={(e) => updateClosedMessage({ description: e.target.value })}
                placeholder="Explain why the form is no longer accepting responses."
                className="min-h-[88px] rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4 py-7">
          <SectionLabel>Security</SectionLabel>
          <div className="space-y-3">
            <ToggleRow
              title="Password Protection"
              description="Require respondents to unlock the form before continuing."
              checked={Boolean(mergedSettings.access?.passwordProtection?.enabled)}
              onCheckedChange={(checked) => updatePasswordProtection({ enabled: checked })}
            >
              {mergedSettings.access?.passwordProtection?.enabled && (
                <div className="space-y-1.5">
                  <Label htmlFor="survey-password" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="survey-password"
                    type="password"
                    value={mergedSettings.access?.passwordProtection?.password || ''}
                    onChange={(e) => updatePasswordProtection({ password: e.target.value })}
                    placeholder={mergedSettings.access?.passwordProtection?.hasPassword ? 'Stored — type to replace' : 'Enter a password'}
                    className="rounded-xl border-border/70 bg-background"
                  />
                  {mergedSettings.access?.passwordProtection?.hasPassword && (
                    <p className="text-xs text-muted-foreground">A password is already set for this form.</p>
                  )}
                </div>
              )}
            </ToggleRow>

            <ToggleRow
              title="Duplicate Protection"
              description="Prevent multiple submissions from the same respondent key."
              checked={Boolean(mergedSettings.access?.duplicateProtection?.enabled)}
              onCheckedChange={(checked) => updateDuplicateProtection({ enabled: checked })}
            >
              {mergedSettings.access?.duplicateProtection?.enabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="survey-duplicate-ref" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Unique Field Ref
                    </Label>
                    <Input
                      id="survey-duplicate-ref"
                      value={mergedSettings.access?.duplicateProtection?.uniqueFieldRef || ''}
                      onChange={(e) => updateDuplicateProtection({ uniqueFieldRef: e.target.value })}
                      placeholder="hidden:lead_id"
                      className="rounded-xl border-border/70 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="survey-duplicate-scope" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Applies To
                    </Label>
                    <select
                      id="survey-duplicate-scope"
                      value={mergedSettings.access?.duplicateProtection?.appliesTo || 'submitted'}
                      onChange={(e) => updateDuplicateProtection({ appliesTo: e.target.value as 'submitted' | 'submitted_and_partial' })}
                      className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none focus:border-foreground/25"
                    >
                      <option value="submitted">Submitted responses</option>
                      <option value="submitted_and_partial">Submitted and in-progress</option>
                    </select>
                  </div>
                </div>
              )}
            </ToggleRow>
          </div>
        </div>

        {/* Behavior */}
        <div className="space-y-4 py-7">
          <SectionLabel>Behavior</SectionLabel>
          <div className="space-y-3">
            <ToggleRow
              title="Auto-Jump Single Pages"
              description="Advance automatically on single-question pages when possible."
              checked={Boolean(mergedSettings.behavior?.autoJumpSingleQuestionPages)}
              onCheckedChange={(checked) => updateBehavior({ autoJumpSingleQuestionPages: checked })}
            />
            <ToggleRow
              title="Save Local Draft"
              description="Keep unfinished progress in the browser."
              checked={Boolean(mergedSettings.behavior?.saveLocalDraft)}
              onCheckedChange={(checked) => updateBehavior({ saveLocalDraft: checked })}
            />
            <ToggleRow
              title="Capture Partial Submissions"
              description="Store in-progress responses server-side."
              checked={Boolean(mergedSettings.behavior?.capturePartialSubmissions)}
              onCheckedChange={(checked) => updateBehavior({ capturePartialSubmissions: checked })}
            />
          </div>
        </div>

      </div>
    </section>
  );
};
