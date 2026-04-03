import React from 'react';
import { EyeOff, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { HiddenFieldDefinition } from '@/types/survey';

interface HiddenFieldsCardProps {
  hiddenFields?: HiddenFieldDefinition[];
  onHiddenFieldsChange: (hiddenFields: HiddenFieldDefinition[]) => void;
}

const createHiddenField = (): HiddenFieldDefinition => ({
  id: crypto.randomUUID(),
  key: '',
  defaultValue: '',
  allowQueryOverride: true,
});

export const HiddenFieldsCard: React.FC<HiddenFieldsCardProps> = ({
  hiddenFields = [],
  onHiddenFieldsChange,
}) => {
  const updateField = (id: string, updates: Partial<HiddenFieldDefinition>) => {
    onHiddenFieldsChange(
      hiddenFields.map((field) => (
        field.id === id
          ? { ...field, ...updates }
          : field
      )),
    );
  };

  const removeField = (id: string) => {
    onHiddenFieldsChange(hiddenFields.filter((field) => field.id !== id));
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <EyeOff className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Hidden Fields
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture URL-driven values like campaign IDs, source, or respondent context.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={() => onHiddenFieldsChange([...hiddenFields, createHiddenField()])}
        >
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      </div>

      <div className="space-y-4 px-6 py-8 sm:px-8">
        {hiddenFields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/[0.05] px-4 py-5 text-sm text-muted-foreground">
            Add hidden fields to capture values from the public form URL without showing them to respondents.
          </div>
        ) : hiddenFields.map((field, index) => (
          <div key={field.id} className="rounded-[26px] border border-border/70 bg-muted/[0.05] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Hidden Field {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`hidden-field-key-${field.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Key
                </Label>
                <Input
                  id={`hidden-field-key-${field.id}`}
                  value={field.key}
                  onChange={(e) => updateField(field.id, { key: e.target.value })}
                  placeholder="lead_id"
                  className="rounded-xl border-border/70 bg-muted/[0.08]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`hidden-field-default-${field.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Default Value
                </Label>
                <Input
                  id={`hidden-field-default-${field.id}`}
                  value={field.defaultValue || ''}
                  onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                  placeholder="fallback-123"
                  className="rounded-xl border-border/70 bg-muted/[0.08]"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Allow Query Override</p>
                  <p className="text-xs text-muted-foreground">Use a matching query-string value when it is present.</p>
                </div>
                <Switch
                  checked={Boolean(field.allowQueryOverride)}
                  onCheckedChange={(checked) => updateField(field.id, { allowQueryOverride: checked })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
