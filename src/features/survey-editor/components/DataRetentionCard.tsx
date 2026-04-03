import React from 'react';
import { ArchiveRestore } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SurveyRetention } from '@/types/survey';

interface DataRetentionCardProps {
  retention?: SurveyRetention;
  onRetentionChange: (retention: SurveyRetention) => void;
}

const DEFAULT_RETENTION: SurveyRetention = {
  enabled: false,
  value: 30,
  unit: 'days',
  trashGracePeriodDays: 30,
};

export const DataRetentionCard: React.FC<DataRetentionCardProps> = ({
  retention,
  onRetentionChange,
}) => {
  const mergedRetention: SurveyRetention = {
    ...DEFAULT_RETENTION,
    ...retention,
  };

  const updateRetention = (updates: Partial<SurveyRetention>) => {
    onRetentionChange({
      ...mergedRetention,
      ...updates,
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <ArchiveRestore className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Data Retention
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Move expired responses to trash first, then purge them after a grace window.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Retention Policy</p>
              <p className="text-xs text-muted-foreground">Automatically archive and purge old submissions for this form.</p>
            </div>
            <Switch
              checked={Boolean(mergedRetention.enabled)}
              onCheckedChange={(checked) => updateRetention({ enabled: checked })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="retention-value" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Retain For
            </Label>
            <Input
              id="retention-value"
              type="number"
              min={1}
              value={mergedRetention.value ?? ''}
              onChange={(e) => updateRetention({ value: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded-xl border-border/70 bg-muted/[0.08]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="retention-unit" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Unit
            </Label>
            <select
              id="retention-unit"
              value={mergedRetention.unit || 'days'}
              onChange={(e) => updateRetention({ unit: e.target.value as SurveyRetention['unit'] })}
              className="h-10 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm text-foreground outline-none"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trash-grace-period" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trash Grace Period
          </Label>
          <Input
            id="trash-grace-period"
            type="number"
            min={0}
            value={mergedRetention.trashGracePeriodDays ?? ''}
            onChange={(e) => updateRetention({ trashGracePeriodDays: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
          <p className="text-xs text-muted-foreground">
            Responses stay recoverable in trash for this many days before permanent purge.
          </p>
        </div>
      </div>
    </section>
  );
};
