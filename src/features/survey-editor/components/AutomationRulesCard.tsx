import React from 'react';
import { Plus, Split, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AutomationAction, AutomationCondition, AutomationRule } from '@/types/survey';

interface AutomationRulesCardProps {
  automationRules?: AutomationRule[];
  onAutomationRulesChange: (automationRules: AutomationRule[]) => void;
}

const createCondition = (): AutomationCondition => ({
  field: '',
  operator: 'equals',
  value: '',
});

const createAction = (): AutomationAction => ({
  type: 'calculate',
  targetField: '',
  operator: 'assign',
  operands: [
    {
      kind: 'field',
      value: '',
    },
  ],
});

const createRule = (): AutomationRule => ({
  id: crypto.randomUUID(),
  name: '',
  when: {
    operator: 'all',
    conditions: [createCondition()],
  },
  actions: [createAction()],
});

const needsConditionValue = (operator: AutomationCondition['operator']) => !['isAnswered', 'isNotAnswered'].includes(operator);

export const AutomationRulesCard: React.FC<AutomationRulesCardProps> = ({
  automationRules = [],
  onAutomationRulesChange,
}) => {
  const updateRule = (id: string, updates: Partial<AutomationRule>) => {
    onAutomationRulesChange(
      automationRules.map((rule) => (
        rule.id === id
          ? { ...rule, ...updates }
          : rule
      )),
    );
  };

  const updateCondition = (ruleId: string, conditionIndex: number, updates: Partial<AutomationCondition>) => {
    const rule = automationRules.find((entry) => entry.id === ruleId);

    if (!rule) {
      return;
    }

    updateRule(ruleId, {
      when: {
        ...rule.when,
        conditions: rule.when.conditions.map((condition, index) => (
          index === conditionIndex && 'field' in condition
            ? { ...condition, ...updates }
            : condition
        )),
      },
    });
  };

  const updateAction = (ruleId: string, actionIndex: number, nextAction: AutomationAction) => {
    const rule = automationRules.find((entry) => entry.id === ruleId);

    if (!rule) {
      return;
    }

    updateRule(ruleId, {
      actions: rule.actions.map((action, index) => (
        index === actionIndex ? nextAction : action
      )),
    });
  };

  const addCondition = (ruleId: string) => {
    const rule = automationRules.find((entry) => entry.id === ruleId);

    if (!rule) {
      return;
    }

    updateRule(ruleId, {
      when: {
        ...rule.when,
        conditions: [...rule.when.conditions, createCondition()],
      },
    });
  };

  const addAction = (ruleId: string) => {
    const rule = automationRules.find((entry) => entry.id === ruleId);

    if (!rule) {
      return;
    }

    updateRule(ruleId, {
      actions: [...rule.actions, createAction()],
    });
  };

  const removeRule = (ruleId: string) => {
    onAutomationRulesChange(automationRules.filter((rule) => rule.id !== ruleId));
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <Split className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Automation Rules
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Trigger visibility, required state, jumps, completion behavior, and calculated values from respondent input.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={() => onAutomationRulesChange([...automationRules, createRule()])}
        >
          <Plus className="h-4 w-4" />
          Add rule
        </Button>
      </div>

      <div className="space-y-4 px-6 py-8 sm:px-8">
        {automationRules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/[0.05] px-4 py-5 text-sm text-muted-foreground">
            Add automation rules to calculate values, branch respondents, or change which questions are required.
          </div>
        ) : automationRules.map((rule, ruleIndex) => (
          <div key={rule.id} className="rounded-[26px] border border-border/70 bg-muted/[0.05] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label htmlFor={`automation-rule-name-${rule.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Rule {ruleIndex + 1}
                </Label>
                <Input
                  id={`automation-rule-name-${rule.id}`}
                  value={rule.name}
                  onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                  placeholder="Enterprise flow"
                  className="mt-2 rounded-xl border-border/70 bg-background"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => removeRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/70 bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">When</p>
                  <p className="text-xs text-muted-foreground">Combine conditions with all or any.</p>
                </div>

                <select
                  value={rule.when.operator}
                  onChange={(e) => updateRule(rule.id, {
                    when: {
                      ...rule.when,
                      operator: e.target.value as AutomationRule['when']['operator'],
                    },
                  })}
                  className="h-10 rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm text-foreground outline-none"
                >
                  <option value="all">All conditions</option>
                  <option value="any">Any condition</option>
                </select>
              </div>

              {rule.when.conditions.map((condition, conditionIndex) => (
                'field' in condition ? (
                  <div key={`${rule.id}-condition-${conditionIndex}`} className="grid gap-3 rounded-2xl border border-border/70 bg-muted/[0.04] p-3 md:grid-cols-[1.3fr_1fr_1fr]">
                    <Input
                      value={condition.field}
                      onChange={(e) => updateCondition(rule.id, conditionIndex, { field: e.target.value })}
                      placeholder="question:q-plan"
                      className="rounded-xl border-border/70 bg-background"
                    />

                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(rule.id, conditionIndex, {
                        operator: e.target.value as AutomationCondition['operator'],
                      })}
                      className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                    >
                      <option value="equals">equals</option>
                      <option value="notEquals">not equals</option>
                      <option value="isAnswered">is answered</option>
                      <option value="isNotAnswered">is empty</option>
                      <option value="contains">contains</option>
                      <option value="notContains">not contains</option>
                      <option value="greaterThan">greater than</option>
                      <option value="greaterThanOrEqual">greater than or equal</option>
                      <option value="lessThan">less than</option>
                      <option value="lessThanOrEqual">less than or equal</option>
                    </select>

                    <Input
                      value={condition.value === undefined ? '' : String(condition.value)}
                      onChange={(e) => updateCondition(rule.id, conditionIndex, { value: e.target.value })}
                      placeholder="enterprise"
                      disabled={!needsConditionValue(condition.operator)}
                      className="rounded-xl border-border/70 bg-background"
                    />
                  </div>
                ) : null
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => addCondition(rule.id)}
              >
                <Plus className="h-4 w-4" />
                Add condition
              </Button>
            </div>

            <div className="mt-4 space-y-4 rounded-2xl border border-border/70 bg-background p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Then</p>
                <p className="text-xs text-muted-foreground">Actions run in order from top to bottom.</p>
              </div>

              {rule.actions.map((action, actionIndex) => (
                <div key={`${rule.id}-action-${actionIndex}`} className="space-y-3 rounded-2xl border border-border/70 bg-muted/[0.04] p-3">
                  <select
                    value={action.type}
                    onChange={(e) => {
                      const nextType = e.target.value as AutomationAction['type'];

                      if (nextType === 'calculate') {
                        updateAction(rule.id, actionIndex, createAction());
                        return;
                      }

                      if (nextType === 'show_question' || nextType === 'hide_question') {
                        updateAction(rule.id, actionIndex, {
                          type: nextType,
                          targetQuestionId: '',
                        });
                        return;
                      }

                      if (nextType === 'set_required') {
                        updateAction(rule.id, actionIndex, {
                          type: 'set_required',
                          targetQuestionId: '',
                          required: true,
                        });
                        return;
                      }

                      if (nextType === 'jump_to_page') {
                        updateAction(rule.id, actionIndex, {
                          type: 'jump_to_page',
                          page: 1,
                        });
                        return;
                      }

                      if (nextType === 'set_completion_redirect') {
                        updateAction(rule.id, actionIndex, {
                          type: 'set_completion_redirect',
                          url: '',
                        });
                        return;
                      }

                      updateAction(rule.id, actionIndex, {
                        type: 'disable_completion',
                        disabled: true,
                      });
                    }}
                    className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                  >
                    <option value="calculate">Calculate computed field</option>
                    <option value="show_question">Show question</option>
                    <option value="hide_question">Hide question</option>
                    <option value="set_required">Set required</option>
                    <option value="jump_to_page">Jump to page</option>
                    <option value="set_completion_redirect">Set completion redirect</option>
                    <option value="disable_completion">Disable completion</option>
                  </select>

                  {action.type === 'calculate' && (
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_1fr]">
                      <Input
                        value={action.targetField}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          targetField: e.target.value,
                        })}
                        placeholder="total"
                        className="rounded-xl border-border/70 bg-background"
                      />
                      <select
                        value={action.operator}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          operator: e.target.value as typeof action.operator,
                        })}
                        className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                      >
                        <option value="assign">assign</option>
                        <option value="add">add</option>
                        <option value="subtract">subtract</option>
                        <option value="multiply">multiply</option>
                        <option value="divide">divide</option>
                        <option value="concatenate">concatenate</option>
                      </select>
                      <Input
                        value={String(action.operands[0]?.value ?? '')}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          operands: [
                            {
                              ...(action.operands[0] ?? { kind: 'field', value: '' }),
                              value: e.target.value,
                            },
                          ],
                        })}
                        placeholder="question:q-hours or 10"
                        className="rounded-xl border-border/70 bg-background"
                      />
                      <select
                        value={action.operands[0]?.kind ?? 'field'}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          operands: [
                            {
                              ...(action.operands[0] ?? { kind: 'field', value: '' }),
                              kind: e.target.value as 'field' | 'literal',
                            },
                          ],
                        })}
                        className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                      >
                        <option value="field">Field ref</option>
                        <option value="literal">Literal</option>
                      </select>
                    </div>
                  )}

                  {(action.type === 'show_question' || action.type === 'hide_question') && (
                    <Input
                      value={action.targetQuestionId}
                      onChange={(e) => updateAction(rule.id, actionIndex, {
                        ...action,
                        targetQuestionId: e.target.value,
                      })}
                      placeholder="q-budget"
                      className="rounded-xl border-border/70 bg-background"
                    />
                  )}

                  {action.type === 'set_required' && (
                    <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                      <Input
                        value={action.targetQuestionId}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          targetQuestionId: e.target.value,
                        })}
                        placeholder="q-contact"
                        className="rounded-xl border-border/70 bg-background"
                      />
                      <select
                        value={action.required ? 'true' : 'false'}
                        onChange={(e) => updateAction(rule.id, actionIndex, {
                          ...action,
                          required: e.target.value === 'true',
                        })}
                        className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                      >
                        <option value="true">Required</option>
                        <option value="false">Optional</option>
                      </select>
                    </div>
                  )}

                  {action.type === 'jump_to_page' && (
                    <Input
                      type="number"
                      value={action.page}
                      onChange={(e) => updateAction(rule.id, actionIndex, {
                        ...action,
                        page: Number(e.target.value || 1),
                      })}
                      placeholder="3"
                      className="rounded-xl border-border/70 bg-background"
                    />
                  )}

                  {action.type === 'set_completion_redirect' && (
                    <Input
                      value={action.url}
                      onChange={(e) => updateAction(rule.id, actionIndex, {
                        ...action,
                        url: e.target.value,
                      })}
                      placeholder="https://example.com/vip"
                      className="rounded-xl border-border/70 bg-background"
                    />
                  )}

                  {action.type === 'disable_completion' && (
                    <select
                      value={(action.disabled ?? true) ? 'true' : 'false'}
                      onChange={(e) => updateAction(rule.id, actionIndex, {
                        ...action,
                        disabled: e.target.value === 'true',
                      })}
                      className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none"
                    >
                      <option value="true">Disable completion</option>
                      <option value="false">Enable completion</option>
                    </select>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => addAction(rule.id)}
              >
                <Plus className="h-4 w-4" />
                Add action
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
