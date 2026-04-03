import React from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ComputedFieldDefinition } from '@/types/survey';

interface ComputedFieldsCardProps {
  computedFields?: ComputedFieldDefinition[];
  onComputedFieldsChange: (computedFields: ComputedFieldDefinition[]) => void;
}

const createComputedField = (): ComputedFieldDefinition => ({
  id: crypto.randomUUID(),
  name: '',
  valueType: 'number',
  initialValue: 0,
});

export const ComputedFieldsCard: React.FC<ComputedFieldsCardProps> = ({
  computedFields = [],
  onComputedFieldsChange,
}) => {
  const updateField = (id: string, updates: Partial<ComputedFieldDefinition>) => {
    onComputedFieldsChange(
      computedFields.map((field) => (
        field.id === id
          ? { ...field, ...updates }
          : field
      )),
    );
  };

  const removeField = (id: string) => {
    onComputedFieldsChange(computedFields.filter((field) => field.id !== id));
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <Calculator className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Computed Fields
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep derived numeric or text values available to logic, redirects, and piped copy.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={() => onComputedFieldsChange([...computedFields, createComputedField()])}
        >
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      </div>

      <div className="space-y-4 px-6 py-8 sm:px-8">
        {computedFields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/[0.05] px-4 py-5 text-sm text-muted-foreground">
            Add computed fields, then update them through automation rules. Reference them as <code>computed:field_name</code>.
          </div>
        ) : computedFields.map((field, index) => (
          <div key={field.id} className="rounded-[26px] border border-border/70 bg-muted/[0.05] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Computed Field {index + 1}
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
                <Label htmlFor={`computed-field-name-${field.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </Label>
                <Input
                  id={`computed-field-name-${field.id}`}
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder="total"
                  className="rounded-xl border-border/70 bg-muted/[0.08]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`computed-field-type-${field.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Type
                </Label>
                <select
                  id={`computed-field-type-${field.id}`}
                  value={field.valueType}
                  onChange={(e) => updateField(field.id, {
                    valueType: e.target.value as ComputedFieldDefinition['valueType'],
                    initialValue: e.target.value === 'number'
                      ? Number(field.initialValue || 0)
                      : String(field.initialValue || ''),
                  })}
                  className="h-10 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm text-foreground outline-none"
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor={`computed-field-initial-${field.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Initial Value
              </Label>
              <Input
                id={`computed-field-initial-${field.id}`}
                type={field.valueType === 'number' ? 'number' : 'text'}
                value={field.initialValue ?? ''}
                onChange={(e) => updateField(field.id, {
                  initialValue: field.valueType === 'number'
                    ? (e.target.value === '' ? 0 : Number(e.target.value))
                    : e.target.value,
                })}
                placeholder={field.valueType === 'number' ? '0' : 'Hello '}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
