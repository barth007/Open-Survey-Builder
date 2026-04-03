import { getAnswerAnalyticsValues, isAnswerValueEmpty } from '@/lib/answer-values';
import { parseFieldReference, toQuestionFieldReference } from '@/lib/field-references';
import type { AnswerValue, ComputedFieldDefinition, ConditionalLogic, Question } from '@/types/survey';

export interface ExpressionRuntimeContext {
  answers?: Record<string, AnswerValue>;
  hiddenFields?: Record<string, string>;
  computedFields?: Record<string, string | number>;
  meta?: Record<string, unknown>;
  questions?: Question[];
}

interface ConditionLeaf {
  field: string;
  operator: 'equals' | 'notEquals' | 'isAnswered' | 'isNotAnswered' | 'contains' | 'notContains' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual';
  value?: unknown;
}

interface ConditionGroup {
  operator: 'all' | 'any';
  conditions: Array<ConditionGroup | ConditionLeaf>;
}

const getQuestionById = (questionId: string, questions: Question[] = []) =>
  questions.find((question) => question.id === questionId);

const mapQuestionOptionLabel = (question: Question | undefined, value: string): string => {
  if (!question) {
    return value;
  }

  return question.options.find((option) => option.id === value || option.value === value)?.text ?? value;
};

const getPrimitiveDisplayValue = (value: unknown): string | number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return undefined;
};

const getQuestionDisplayValue = (
  questionId: string,
  value: AnswerValue | undefined,
  questions: Question[] = [],
): string | number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const question = getQuestionById(questionId, questions);

  if (typeof value === 'string') {
    return mapQuestionOptionLabel(question, value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => mapQuestionOptionLabel(question, entry)).join(', ');
  }

  if (!question) {
    return undefined;
  }

  const analyticsValues = getAnswerAnalyticsValues(question, value);
  return analyticsValues.length > 0 ? analyticsValues.join(', ') : undefined;
};

const isRuntimeValueEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return false;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return isAnswerValueEmpty(value as AnswerValue);
  }

  if (typeof value === 'object' && 'kind' in (value as Record<string, unknown>)) {
    return isAnswerValueEmpty(value as AnswerValue);
  }

  return false;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
};

const isConditionGroup = (condition: ConditionGroup | ConditionLeaf): condition is ConditionGroup =>
  condition.operator === 'all' || condition.operator === 'any';

const matchesComparison = (actual: unknown, expected: unknown): boolean => {
  if (Array.isArray(actual)) {
    return Array.isArray(expected)
      ? expected.some((value) => actual.includes(value as never))
      : actual.includes(expected as never);
  }

  if (Array.isArray(expected)) {
    return expected.includes(actual as never);
  }

  return actual === expected;
};

const evaluateCondition = (
  condition: ConditionLeaf | ConditionGroup,
  context: ExpressionRuntimeContext,
): boolean => {
  if (isConditionGroup(condition)) {
    return evaluateConditionGroup(condition, context);
  }

  const actualValue = getFieldReferenceValue(condition.field, context);

  switch (condition.operator) {
    case 'equals':
      return matchesComparison(actualValue, condition.value);
    case 'notEquals':
      return !matchesComparison(actualValue, condition.value);
    case 'isAnswered':
      return !isRuntimeValueEmpty(actualValue);
    case 'isNotAnswered':
      return isRuntimeValueEmpty(actualValue);
    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(condition.value as never);
      }
      if (typeof actualValue === 'string') {
        return actualValue.includes(String(condition.value ?? ''));
      }
      return false;
    case 'notContains':
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(condition.value as never);
      }
      if (typeof actualValue === 'string') {
        return !actualValue.includes(String(condition.value ?? ''));
      }
      return true;
    case 'greaterThan': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber > expectedNumber;
    }
    case 'greaterThanOrEqual': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber >= expectedNumber;
    }
    case 'lessThan': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber < expectedNumber;
    }
    case 'lessThanOrEqual': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber <= expectedNumber;
    }
    default:
      return true;
  }
};

export const getFieldReferenceValue = (
  fieldReference: string,
  context: ExpressionRuntimeContext,
): unknown => {
  const parsedReference = parseFieldReference(fieldReference);

  if (!parsedReference) {
    return context.answers?.[fieldReference];
  }

  switch (parsedReference.kind) {
    case 'question':
      return context.answers?.[parsedReference.key];
    case 'hidden':
      return context.hiddenFields?.[parsedReference.key];
    case 'computed':
      return context.computedFields?.[parsedReference.key];
    case 'meta':
      return context.meta?.[parsedReference.key];
    default:
      return undefined;
  }
};

export const getFieldReferenceDisplayValue = (
  fieldReference: string,
  context: ExpressionRuntimeContext,
): string | number | undefined => {
  const normalizedReference = toQuestionFieldReference(fieldReference);
  const parsedReference = parseFieldReference(normalizedReference);

  if (!parsedReference) {
    return getPrimitiveDisplayValue(getFieldReferenceValue(fieldReference, context));
  }

  if (parsedReference.kind === 'question') {
    return getQuestionDisplayValue(
      parsedReference.key,
      context.answers?.[parsedReference.key],
      context.questions,
    );
  }

  return getPrimitiveDisplayValue(getFieldReferenceValue(normalizedReference, context));
};

export const evaluateConditionGroup = (
  conditionGroup: ConditionGroup,
  context: ExpressionRuntimeContext,
): boolean => {
  if (conditionGroup.conditions.length === 0) {
    return conditionGroup.operator === 'all';
  }

  if (conditionGroup.operator === 'all') {
    return conditionGroup.conditions.every((condition) => evaluateCondition(condition, context));
  }

  return conditionGroup.conditions.some((condition) => evaluateCondition(condition, context));
};

export const evaluateLegacyConditionalLogic = (
  conditionalLogic: ConditionalLogic | undefined,
  context: ExpressionRuntimeContext,
): boolean => {
  if (!conditionalLogic?.dependsOn) {
    return true;
  }

  return evaluateCondition(
    {
      field: toQuestionFieldReference(conditionalLogic.dependsOn),
      operator: conditionalLogic.operator,
      value: conditionalLogic.value,
    },
    context,
  );
};

export const buildInitialComputedFieldValues = (
  computedFields: ComputedFieldDefinition[] = [],
): Record<string, string | number> => computedFields.reduce<Record<string, string | number>>((acc, field) => {
  if (field.initialValue === undefined || field.initialValue === null || field.initialValue === '') {
    return acc;
  }

  const key = field.name?.trim() || field.id?.trim();

  if (key) {
    acc[key] = field.initialValue;
  }

  return acc;
}, {});
