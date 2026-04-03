import React, { useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  ClipboardList,
  Copy,
  EyeOff,
  GitBranch,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Question, QuestionBlockType } from '@/types/survey';
import {
  EDITOR_BLOCKS,
  getQuestionBlockLabel,
  getNormalizedBlockType,
  getTurnIntoGroup,
  getTurnIntoTargets,
  isContentBlock,
  convertQuestionToBlock,
} from '@/features/survey-editor/lib/editor-blocks';
import {
  getQuestionSettingsPortalProps,
  isQuestionSettingsOwnedTarget,
} from '@/features/survey-editor/lib/question-settings-popover';
interface QuestionSettingsPopoverProps {
  question: Question;
  questions: Question[];
  anchorRect: DOMRect;
  onQuestionChange: (updated: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBulkInsert: () => void;
  onOpenLogic: () => void;
  onClose: () => void;
}

// ── Settings row helpers ─────────────────────────────────────────────────────

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}> = ({ label, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between px-4 py-2.5">
    <span className="text-sm text-foreground/80">{label}</span>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const NumberRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min, max, step = 1 }) => (
  <div className="flex items-center justify-between px-4 py-2">
    <span className="text-sm text-foreground/80">{label}</span>
    <Input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      onClick={(e) => e.stopPropagation()}
      className="h-8 w-20 rounded-xl border-border/70 bg-muted/15 text-center text-xs shadow-none focus-visible:ring-1"
    />
  </div>
);

const TextRow: React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, onChange }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-2">
    <span className="text-sm text-foreground/80">{label}</span>
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="h-8 w-36 rounded-xl border-border/70 bg-muted/15 text-xs shadow-none focus-visible:ring-1"
    />
  </div>
);

const SelectRow: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (v: string) => void;
}> = ({ label, value, options, onValueChange }) => (
  <div className="flex items-center justify-between px-4 py-2">
    <span className="text-sm text-foreground/80">{label}</span>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-28 rounded-xl border-border/70 bg-muted/15 text-xs shadow-none focus:ring-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        {...getQuestionSettingsPortalProps()}
        className="rounded-[18px] border-border/70 p-1"
      >
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-xl text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// ── Dynamic settings per block type ─────────────────────────────────────────

const SettingsSection: React.FC<{
  question: Question;
  blockType: QuestionBlockType;
  onChange: (patch: Partial<Question>) => void;
}> = ({ question, blockType, onChange }) => {
  const supportsBadge = blockType === 'multipleChoice';
  const isLinearScale = blockType === 'linearScale';

  return (
    <div className="py-1">
      <ToggleRow
        label="Required"
        checked={question.isRequired}
        onCheckedChange={(v) => onChange({ isRequired: v })}
      />

      {supportsBadge && (
        <SelectRow
          label="Badge"
          value={question.badgeType ?? 'letters'}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'letters', label: 'Letters' },
            { value: 'numbers', label: 'Numbers' },
          ]}
          onValueChange={(v) => onChange({ badgeType: v as Question['badgeType'] })}
        />
      )}

      {isLinearScale && (
        <>
          <TextRow
            label="Left label"
            value={question.scaleLeftLabel || ''}
            placeholder="Low"
            onChange={(value) => onChange({ scaleLeftLabel: value })}
          />
          <TextRow
            label="Center label"
            value={question.scaleCenterLabel || ''}
            placeholder="Neutral"
            onChange={(value) => onChange({ scaleCenterLabel: value })}
          />
          <TextRow
            label="Right label"
            value={question.scaleRightLabel || ''}
            placeholder="High"
            onChange={(value) => onChange({ scaleRightLabel: value })}
          />
        </>
      )}
    </div>
  );
};

const FieldGroup: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="space-y-2 px-4 py-2.5">
    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
  </div>
);

const SystemSettingsSection: React.FC<{
  question: Question;
  onChange: (patch: Partial<Question>) => void;
}> = ({ question, onChange }) => {
  if (question.type === 'hiddenField') {
    return (
      <div className="py-1">
        <FieldGroup
          label="Field key"
          hint={`Used in URL: ?${question.fieldKey || 'field_key'}=value`}
        >
          <Input
            value={question.fieldKey || ''}
            onChange={(e) => onChange({ fieldKey: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="utm_source"
            className="h-10 rounded-2xl border-border/70 bg-muted/15 shadow-none focus-visible:ring-1"
          />
        </FieldGroup>
        <FieldGroup
          label="Default value"
          hint="Used when the URL parameter is absent"
        >
          <Input
            value={question.fieldDefaultValue || ''}
            onChange={(e) => onChange({ fieldDefaultValue: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="(empty)"
            className="h-10 rounded-2xl border-border/70 bg-muted/15 shadow-none focus-visible:ring-1"
          />
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className="py-1">
      <FieldGroup label="Field name">
        <Input
          value={question.fieldName || ''}
          onChange={(e) => onChange({ fieldName: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="score"
          className="h-10 rounded-2xl border-border/70 bg-muted/15 shadow-none focus-visible:ring-1"
        />
      </FieldGroup>
      <FieldGroup label="Type">
        <Select
          value={question.fieldValueType || 'number'}
          onValueChange={(value) => {
            const fieldValueType = value as 'number' | 'text';
            onChange({
              fieldValueType,
              fieldInitialValue: fieldValueType === 'number' ? 0 : '',
            });
          }}
        >
          <SelectTrigger className="h-10 rounded-2xl border-border/70 bg-muted/15 shadow-none focus:ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            {...getQuestionSettingsPortalProps()}
            className="rounded-[18px] border-border/70 p-1"
          >
            <SelectItem value="number" className="rounded-xl text-sm">Number</SelectItem>
            <SelectItem value="text" className="rounded-xl text-sm">Text</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Initial value" hint="Starting value before any logic runs">
        <Input
          type={question.fieldValueType === 'number' ? 'number' : 'text'}
          value={String(question.fieldInitialValue ?? (question.fieldValueType === 'number' ? 0 : ''))}
          onChange={(e) =>
            onChange({
              fieldInitialValue:
                question.fieldValueType === 'number'
                  ? (parseFloat(e.target.value) || 0)
                  : e.target.value,
            })
          }
          onClick={(e) => e.stopPropagation()}
          placeholder={question.fieldValueType === 'number' ? '0' : ''}
          className="h-10 rounded-2xl border-border/70 bg-muted/15 shadow-none focus-visible:ring-1"
        />
      </FieldGroup>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

export const QuestionSettingsPopover: React.FC<QuestionSettingsPopoverProps> = ({
  question,
  questions,
  anchorRect,
  onQuestionChange,
  onDelete,
  onDuplicate,
  onBulkInsert,
  onOpenLogic,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const blockType = getNormalizedBlockType(question);
  const isContent = isContentBlock(question);
  const isSystem = question.type === 'hiddenField' || question.type === 'calculatedField';
  const turnIntoGroup = getTurnIntoGroup(blockType);
  const turnIntoTargets = getTurnIntoTargets(turnIntoGroup);
  const isChoiceBlock = ['multipleChoice', 'dropdown', 'checkboxes', 'multiSelect'].includes(blockType);
  const title = question.text?.trim() || (isSystem ? getQuestionBlockLabel(question) : 'Untitled question');

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isQuestionSettingsOwnedTarget(ref.current, e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Position: to the left of anchor, clamped inside viewport
  const popoverWidth = 284;
  const gap = 10;
  let left = anchorRect.left - popoverWidth - gap;
  if (left < 8) left = anchorRect.right + gap;
  if (left + popoverWidth > window.innerWidth - 8) left = window.innerWidth - popoverWidth - 8;
  const top = Math.max(8, Math.min(anchorRect.top, window.innerHeight - 520));

  const update = (patch: Partial<Question>) => onQuestionChange({ ...question, ...patch });

  const handleBlockTypeChange = (nextType: QuestionBlockType) => {
    onQuestionChange(convertQuestionToBlock(question, nextType));
  };

  const ActionRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    kbd?: string;
    onClick: (e: React.MouseEvent) => void;
    destructive?: boolean;
  }> = ({ icon, label, kbd, onClick, destructive }) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={cn(
        'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/40',
        destructive && 'hover:text-destructive',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span>{label}</span>
      </div>
      {kbd && <kbd className="text-[10px] text-muted-foreground/50">{kbd}</kbd>}
    </button>
  );

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top, left, width: popoverWidth, zIndex: 200 }}
      className="overflow-hidden rounded-[22px] border border-border/60 bg-background/98 shadow-[0_20px_80px_rgba(0,0,0,0.14)] backdrop-blur-xl"
    >
      {isContent ? (
        /* ── Compact mode ── */
        <div className="py-1">
          <ActionRow icon={<Trash2 className="h-4 w-4" />} label="Delete" kbd="Del" onClick={onDelete} destructive />
          <ActionRow icon={<Copy className="h-4 w-4" />} label="Duplicate" kbd="⌘D" onClick={onDuplicate} />
          <ActionRow
            icon={<EyeOff className="h-4 w-4" />}
            label={question.isVisible === false ? 'Show block' : 'Hide block'}
            kbd="⌘⇧H"
            onClick={() => update({ isVisible: question.isVisible === false ? true : false })}
          />
          {turnIntoTargets.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <span>Turn into</span>
                  </div>
                  <span className="text-xs text-muted-foreground/60">{getQuestionBlockLabel(question)} ∨</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                {...getQuestionSettingsPortalProps()}
                side="right"
                className="rounded-[18px] border-border/70 p-1.5 min-w-[180px]"
              >
                {turnIntoTargets.map((target) => {
                  const def = EDITOR_BLOCKS.find((b) => b.id === target);
                  return (
                    <DropdownMenuItem
                      key={target}
                      onClick={() => handleBlockTypeChange(target)}
                      className="rounded-xl text-sm"
                    >
                      {def?.label ?? target}
                      {target === blockType && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : (
        /* ── Full mode ── */
        <>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
            <div className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {getQuestionBlockLabel(question)}
            </div>
            <div className="flex-1 truncate text-sm font-semibold text-foreground/80">
              {title.substring(0, 40)}
              {title.length > 40 ? '…' : ''}
            </div>
          </div>

          {/* Settings */}
          {isSystem ? (
            <SystemSettingsSection question={question} onChange={update} />
          ) : (
            <SettingsSection
              question={question}
              blockType={blockType}
              onChange={update}
            />
          )}

          <Separator className="mx-4 my-1 bg-border/40" />

          {/* Actions */}
          <div className="py-1">
            <ActionRow icon={<Trash2 className="h-4 w-4" />} label="Delete" kbd="Del" onClick={onDelete} destructive />
            <ActionRow icon={<Copy className="h-4 w-4" />} label="Duplicate" kbd="⌘D" onClick={onDuplicate} />
            <ActionRow
              icon={<EyeOff className="h-4 w-4" />}
              label={question.isVisible === false ? 'Show block' : 'Hide block'}
              kbd="⌘⇧H"
              onClick={() => update({ isVisible: question.isVisible === false ? true : false })}
            />
            {!isSystem && (
              <ActionRow
                icon={<GitBranch className="h-4 w-4" />}
                label="Conditional logic"
                kbd="⌘⇧L"
                onClick={onOpenLogic}
              />
            )}
            {!isSystem && isChoiceBlock && (
              <ActionRow
                icon={<ClipboardList className="h-4 w-4" />}
                label="Bulk insert options"
                kbd="⌘⇧O"
                onClick={onBulkInsert}
              />
            )}

            {turnIntoTargets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      <span>Turn into</span>
                    </div>
                    <span className="text-xs text-muted-foreground/60">{getQuestionBlockLabel(question)} ∨</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  {...getQuestionSettingsPortalProps()}
                  side="right"
                  className="rounded-[18px] border-border/70 p-1.5 min-w-[180px]"
                >
                  {turnIntoTargets.map((target) => {
                    const def = EDITOR_BLOCKS.find((b) => b.id === target);
                    return (
                      <DropdownMenuItem
                        key={target}
                        onClick={() => handleBlockTypeChange(target)}
                        className="rounded-xl text-sm"
                      >
                        {def?.label ?? target}
                        {target === blockType && <span className="ml-auto text-primary">✓</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

        </>
      )}
    </div>
  );
};
