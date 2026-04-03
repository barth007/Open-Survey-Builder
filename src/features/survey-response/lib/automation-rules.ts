import { evaluateConditionGroup, type ExpressionRuntimeContext } from './expression-runtime';
import { applyCalculationAction } from './computed-fields';
import type { AutomationRule } from '@/types/survey';

export interface AutomationRuntimeState {
  computedFields: Record<string, string | number>;
  questionVisibility: Record<string, boolean>;
  questionRequired: Record<string, boolean>;
  jumpToPage?: number;
  completionRedirect?: string;
  completionDisabled: boolean;
  triggeredRuleIds: string[];
}

const normalizeKey = (value: string | undefined): string => value?.trim() || '';

const createInitialRuntimeState = (
  context: ExpressionRuntimeContext,
): AutomationRuntimeState => ({
  computedFields: { ...(context.computedFields ?? {}) },
  questionVisibility: {},
  questionRequired: {},
  jumpToPage: undefined,
  completionRedirect: undefined,
  completionDisabled: false,
  triggeredRuleIds: [],
});

export const evaluateAutomationRules = (
  automationRules: AutomationRule[] = [],
  context: ExpressionRuntimeContext,
): AutomationRuntimeState => {
  const state = createInitialRuntimeState(context);

  for (const rule of automationRules) {
    const runtimeContext: ExpressionRuntimeContext = {
      ...context,
      computedFields: state.computedFields,
    };

    if (!evaluateConditionGroup(rule.when, runtimeContext)) {
      continue;
    }

    state.triggeredRuleIds.push(rule.id);

    for (const action of rule.actions) {
      switch (action.type) {
        case 'calculate': {
          const targetField = normalizeKey(action.targetField);

          if (!targetField) {
            break;
          }

          state.computedFields[targetField] = applyCalculationAction(
            state.computedFields[targetField],
            action,
            {
              ...runtimeContext,
              computedFields: state.computedFields,
            },
          ) ?? state.computedFields[targetField];
          break;
        }
        case 'show_question': {
          const targetQuestionId = normalizeKey(action.targetQuestionId);

          if (targetQuestionId) {
            state.questionVisibility[targetQuestionId] = true;
          }
          break;
        }
        case 'hide_question': {
          const targetQuestionId = normalizeKey(action.targetQuestionId);

          if (targetQuestionId) {
            state.questionVisibility[targetQuestionId] = false;
          }
          break;
        }
        case 'set_required': {
          const targetQuestionId = normalizeKey(action.targetQuestionId);

          if (targetQuestionId) {
            state.questionRequired[targetQuestionId] = action.required;
          }
          break;
        }
        case 'jump_to_page':
          if (Number.isFinite(action.page) && action.page > 0) {
            state.jumpToPage = action.page;
          }
          break;
        case 'set_completion_redirect':
          state.completionRedirect = action.url?.trim() || undefined;
          break;
        case 'disable_completion':
          state.completionDisabled = action.disabled ?? true;
          break;
        default:
          break;
      }
    }
  }

  return state;
};
