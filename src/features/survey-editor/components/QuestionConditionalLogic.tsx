
import React, { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getQuestionSettingsPortalProps } from '@/features/survey-editor/lib/question-settings-popover';
import type {
  LogicAction,
  LogicActionCalculate,
  LogicActionJumpToPage,
  LogicActionRequireAnswer,
  LogicActionShowBlock,
  LogicCondition,
  LogicConditionOperator,
  Question,
  QuestionLogic,
} from '@/types/survey';

interface QuestionConditionalLogicProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updated: Question) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const operatorLabels: Record<LogicConditionOperator, string> = {
  is: 'is',
  isNot: 'is not',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
  isAnyOf: 'is any of',
  isNotAnyOf: 'is not any of',
};

const operatorsNeedingValue: LogicConditionOperator[] = ['is', 'isNot', 'isAnyOf', 'isNotAnyOf'];
const operatorsNeedingMultiValue: LogicConditionOperator[] = ['isAnyOf', 'isNotAnyOf'];

const blankCondition = (): LogicCondition => ({
  id: crypto.randomUUID(),
  questionId: '',
  operator: 'is',
  values: [],
});

const blankAction = (type: LogicAction['type']): LogicAction => {
  switch (type) {
    case 'show_block':
      return { id: crypto.randomUUID(), type: 'show_block', targetId: '' };
    case 'hide_block':
      return { id: crypto.randomUUID(), type: 'hide_block', targetId: '' };
    case 'jump_to_page':
      return { id: crypto.randomUUID(), type: 'jump_to_page', page: 2 };
    case 'calculate':
      return { id: crypto.randomUUID(), type: 'calculate', fieldName: '', operator: 'assign', value: '' };
    case 'require_answer':
      return { id: crypto.randomUUID(), type: 'require_answer', targetId: '' };
    case 'disable_completion':
      return { id: crypto.randomUUID(), type: 'disable_completion' };
  }
};

// ── Multi-value picker ───────────────────────────────────────────────────────

const MultiValuePicker: React.FC<{
  options: { id: string; text: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]);

  const labels = selected
    .map((id) => options.find((o) => o.id === id)?.text)
    .filter(Boolean) as string[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-h-[2.25rem] flex-1 flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted/15 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {labels.length > 0 ? (
            labels.map((label, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {label}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Select values…</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        {...getQuestionSettingsPortalProps()}
        className="w-72 rounded-2xl border-border/70 p-2"
        align="start"
      >
        <div className="space-y-0.5">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/40"
            >
              <Checkbox
                checked={selected.includes(option.id)}
                onCheckedChange={() => toggle(option.id)}
              />
              <span className="text-sm">{option.text}</span>
            </label>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              No options available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ── Condition row ────────────────────────────────────────────────────────────

const ConditionRow: React.FC<{
  condition: LogicCondition;
  questions: Question[];
  currentQuestionId: string;
  onChange: (updated: LogicCondition) => void;
  onDelete: () => void;
}> = ({ condition, questions, currentQuestionId, onChange, onDelete }) => {
  const available = questions.filter((q) => q.id !== currentQuestionId);
  const source = available.find((q) => q.id === condition.questionId);
  const needsValue = operatorsNeedingValue.includes(condition.operator);
  const needsMulti = operatorsNeedingMultiValue.includes(condition.operator);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/[0.025] p-3">
      <div className="flex items-start gap-2">
        {/* Source question */}
        <Select
          value={condition.questionId || '__none__'}
          onValueChange={(v) =>
            onChange({ ...condition, questionId: v === '__none__' ? '' : v, values: [] })
          }
        >
          <SelectTrigger className="flex-1 h-9 rounded-xl border-border/70 bg-background text-xs shadow-none">
            <SelectValue placeholder="Select question…" />
          </SelectTrigger>
          <SelectContent
            {...getQuestionSettingsPortalProps()}
            className="rounded-2xl border-border/70 p-1.5 max-h-64"
          >
            <SelectItem value="__none__" className="rounded-xl text-xs text-muted-foreground">
              — select question —
            </SelectItem>
            {available.map((q) => (
              <SelectItem key={q.id} value={q.id} className="rounded-xl text-xs">
                {(q.text?.substring(0, 52) || '(untitled)') + ((q.text?.length ?? 0) > 52 ? '…' : '')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Operator */}
        <Select
          value={condition.operator}
          onValueChange={(v) =>
            onChange({ ...condition, operator: v as LogicConditionOperator, values: [] })
          }
        >
          <SelectTrigger className="w-[148px] h-9 rounded-xl border-border/70 bg-background text-xs shadow-none shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            {...getQuestionSettingsPortalProps()}
            className="rounded-2xl border-border/70 p-1.5"
          >
            {(Object.keys(operatorLabels) as LogicConditionOperator[]).map((op) => (
              <SelectItem key={op} value={op} className="rounded-xl text-xs">
                {operatorLabels[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Value picker */}
      {needsValue && condition.questionId && source && (
        <div className="flex pl-0.5">
          {needsMulti ? (
            <MultiValuePicker
              options={source.options}
              selected={condition.values}
              onChange={(values) => onChange({ ...condition, values })}
            />
          ) : (
            <Select
              value={condition.values[0] || '__none__'}
              onValueChange={(v) =>
                onChange({ ...condition, values: v === '__none__' ? [] : [v] })
              }
            >
              <SelectTrigger className="flex-1 h-9 rounded-xl border-border/70 bg-background text-xs shadow-none">
                <SelectValue placeholder="Select value…" />
              </SelectTrigger>
              <SelectContent
                {...getQuestionSettingsPortalProps()}
                className="rounded-2xl border-border/70 p-1.5"
              >
                <SelectItem value="__none__" className="rounded-xl text-xs text-muted-foreground">
                  — select value —
                </SelectItem>
                {source.options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="rounded-xl text-xs">
                    {opt.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
};

// ── Action row ───────────────────────────────────────────────────────────────

const actionTypeLabels: Record<LogicAction['type'], string> = {
  show_block: 'Show block',
  hide_block: 'Hide block',
  jump_to_page: 'Jump to page',
  calculate: 'Calculate',
  require_answer: 'Require answer',
  disable_completion: 'Disable completion',
};

const ActionRow: React.FC<{
  action: LogicAction;
  questions: Question[];
  currentQuestionId: string;
  onChange: (updated: LogicAction) => void;
  onDelete: () => void;
}> = ({ action, questions, currentQuestionId, onChange, onDelete }) => {
  const others = questions.filter((q) => q.id !== currentQuestionId);

  const BlockSelector: React.FC<{ targetId: string; onSelect: (id: string) => void }> = ({
    targetId,
    onSelect,
  }) => (
    <Select
      value={targetId || '__none__'}
      onValueChange={(v) => onSelect(v === '__none__' ? '' : v)}
    >
      <SelectTrigger className="flex-1 h-9 rounded-xl border-border/70 bg-background text-xs shadow-none">
        <SelectValue placeholder="Select block…" />
      </SelectTrigger>
      <SelectContent
        {...getQuestionSettingsPortalProps()}
        className="rounded-2xl border-border/70 p-1.5 max-h-64"
      >
        <SelectItem value="__none__" className="rounded-xl text-xs text-muted-foreground">
          — select block —
        </SelectItem>
        {others.map((q) => (
          <SelectItem key={q.id} value={q.id} className="rounded-xl text-xs">
            {(q.text?.substring(0, 52) || '(untitled)') + ((q.text?.length ?? 0) > 52 ? '…' : '')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/[0.025] p-3">
      <div className="flex items-center gap-2">
        <Select
          value={action.type}
          onValueChange={(v) => onChange(blankAction(v as LogicAction['type']))}
        >
          <SelectTrigger className="flex-1 h-9 rounded-xl border-border/70 bg-background text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            {...getQuestionSettingsPortalProps()}
            className="rounded-2xl border-border/70 p-1.5"
          >
            {(Object.keys(actionTypeLabels) as LogicAction['type'][]).map((t) => (
              <SelectItem key={t} value={t} className="rounded-xl text-xs">
                {actionTypeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {(action.type === 'show_block' || action.type === 'hide_block') && (
        <BlockSelector
          targetId={(action as LogicActionShowBlock).targetId}
          onSelect={(id) => onChange({ ...action, targetId: id } as LogicAction)}
        />
      )}

      {action.type === 'require_answer' && (
        <BlockSelector
          targetId={(action as LogicActionRequireAnswer).targetId}
          onSelect={(id) => onChange({ ...action, targetId: id } as LogicAction)}
        />
      )}

      {action.type === 'jump_to_page' && (
        <Input
          type="number"
          min={1}
          value={(action as LogicActionJumpToPage).page}
          onChange={(e) =>
            onChange({ ...action, page: Math.max(1, parseInt(e.target.value, 10) || 1) } as LogicActionJumpToPage)
          }
          placeholder="Page number"
          className="h-9 rounded-xl border-border/70 bg-background text-xs shadow-none"
        />
      )}

      {action.type === 'calculate' && (
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={(action as LogicActionCalculate).fieldName}
            onChange={(e) =>
              onChange({ ...action, fieldName: e.target.value } as LogicActionCalculate)
            }
            placeholder="Field name"
            className="h-9 rounded-xl border-border/70 bg-background text-xs shadow-none"
          />
          <Select
            value={(action as LogicActionCalculate).operator}
            onValueChange={(v) =>
              onChange({ ...action, operator: v } as LogicActionCalculate)
            }
          >
            <SelectTrigger className="h-9 rounded-xl border-border/70 bg-background text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              {...getQuestionSettingsPortalProps()}
              className="rounded-2xl border-border/70 p-1.5"
            >
              {(['assign', 'add', 'subtract', 'multiply', 'divide'] as const).map((op) => (
                <SelectItem key={op} value={op} className="rounded-xl text-xs capitalize">
                  {op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={(action as LogicActionCalculate).value}
            onChange={(e) =>
              onChange({ ...action, value: e.target.value } as LogicActionCalculate)
            }
            placeholder="Value"
            className="h-9 rounded-xl border-border/70 bg-background text-xs shadow-none"
          />
        </div>
      )}

      {action.type === 'disable_completion' && (
        <p className="px-1 text-[11px] text-muted-foreground">
          The submit / next button will be hidden when this rule matches.
        </p>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const QuestionConditionalLogic: React.FC<QuestionConditionalLogicProps> = ({
  question,
  questions,
  onQuestionChange,
}) => {
  const logic = question.logic;

  const updateLogic = useCallback(
    (patch: Partial<QuestionLogic>) => {
      const base: QuestionLogic = {
        conditionOperator: 'all',
        conditions: [],
        actions: [],
        ...logic,
      };
      onQuestionChange({ ...question, logic: { ...base, ...patch } });
    },
    [question, logic, onQuestionChange],
  );

  const addCondition = () =>
    updateLogic({ conditions: [...(logic?.conditions ?? []), blankCondition()] });

  const updateCondition = (id: string, updated: LogicCondition) =>
    updateLogic({
      conditions: (logic?.conditions ?? []).map((c) => (c.id === id ? updated : c)),
    });

  const deleteCondition = (id: string) =>
    updateLogic({ conditions: (logic?.conditions ?? []).filter((c) => c.id !== id) });

  const addAction = () =>
    updateLogic({ actions: [...(logic?.actions ?? []), blankAction('show_block')] });

  const updateAction = (id: string, updated: LogicAction) =>
    updateLogic({
      actions: (logic?.actions ?? []).map((a) => (a.id === id ? updated : a)),
    });

  const deleteAction = (id: string) =>
    updateLogic({ actions: (logic?.actions ?? []).filter((a) => a.id !== id) });

  const toggleOperator = () =>
    updateLogic({ conditionOperator: logic?.conditionOperator === 'all' ? 'any' : 'all' });

  return (
    <div className="space-y-8">
      {/* ── Conditions ── */}
      <div className="space-y-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          When
        </div>

        {(logic?.conditions ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-[11px] text-muted-foreground/60">
            No conditions yet — action always fires.
          </p>
        )}

        {(logic?.conditions ?? []).map((condition, index) => (
          <React.Fragment key={condition.id}>
            {index > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <button
                  type="button"
                  onClick={toggleOperator}
                  className="rounded-full border border-border/70 bg-muted/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                >
                  {logic?.conditionOperator === 'all' ? 'AND' : 'OR'}
                </button>
                <div className="h-px flex-1 bg-border/40" />
              </div>
            )}
            <ConditionRow
              condition={condition}
              questions={questions}
              currentQuestionId={question.id}
              onChange={(updated) => updateCondition(condition.id, updated)}
              onDelete={() => deleteCondition(condition.id)}
            />
          </React.Fragment>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
          className="gap-1.5 rounded-full border-border/70 bg-background px-3 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add condition
        </Button>
      </div>

      {/* ── Actions ── */}
      <div className="space-y-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Then
        </div>

        {(logic?.actions ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-[11px] text-muted-foreground/60">
            No actions yet.
          </p>
        )}

        {(logic?.actions ?? []).map((action) => (
          <ActionRow
            key={action.id}
            action={action}
            questions={questions}
            currentQuestionId={question.id}
            onChange={(updated) => updateAction(action.id, updated)}
            onDelete={() => deleteAction(action.id)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAction}
          className="gap-1.5 rounded-full border-border/70 bg-background px-3 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add action
        </Button>
      </div>
    </div>
  );
};

export default QuestionConditionalLogic;
