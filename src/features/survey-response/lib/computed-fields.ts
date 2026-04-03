import { getFieldReferenceDisplayValue, getFieldReferenceValue, type ExpressionRuntimeContext } from './expression-runtime';
import type { AutomationCalculateAction, AutomationOperand } from '@/types/survey';

const resolveOperandRawValue = (
  operand: AutomationOperand | undefined,
  context: ExpressionRuntimeContext,
): string | number | undefined => {
  if (!operand) {
    return undefined;
  }

  if (operand.kind === 'field') {
    const fieldValue = getFieldReferenceValue(String(operand.value), context);

    if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
      return fieldValue;
    }

    return undefined;
  }

  return operand.value;
};

const resolveOperandDisplayValue = (
  operand: AutomationOperand | undefined,
  context: ExpressionRuntimeContext,
): string => {
  if (!operand) {
    return '';
  }

  if (operand.kind === 'field') {
    const displayValue = getFieldReferenceDisplayValue(String(operand.value), context);
    return displayValue === undefined ? '' : String(displayValue);
  }

  return String(operand.value);
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

export const applyCalculationAction = (
  currentValue: string | number | undefined,
  action: AutomationCalculateAction,
  context: ExpressionRuntimeContext,
): string | number | undefined => {
  const firstOperand = action.operands[0];
  const resolvedRawOperand = resolveOperandRawValue(firstOperand, context);

  switch (action.operator) {
    case 'assign':
      return typeof resolvedRawOperand === 'string' || typeof resolvedRawOperand === 'number'
        ? resolvedRawOperand
        : currentValue;
    case 'add': {
      const currentNumber = toFiniteNumber(currentValue) ?? 0;
      const operandNumber = toFiniteNumber(resolvedRawOperand);
      return operandNumber === null ? currentNumber : currentNumber + operandNumber;
    }
    case 'subtract': {
      const currentNumber = toFiniteNumber(currentValue) ?? 0;
      const operandNumber = toFiniteNumber(resolvedRawOperand);
      return operandNumber === null ? currentNumber : currentNumber - operandNumber;
    }
    case 'multiply': {
      const currentNumber = toFiniteNumber(currentValue) ?? 0;
      const operandNumber = toFiniteNumber(resolvedRawOperand);
      return operandNumber === null ? currentNumber : currentNumber * operandNumber;
    }
    case 'divide': {
      const currentNumber = toFiniteNumber(currentValue) ?? 0;
      const operandNumber = toFiniteNumber(resolvedRawOperand);

      if (operandNumber === null || operandNumber === 0) {
        return currentNumber;
      }

      return currentNumber / operandNumber;
    }
    case 'concatenate':
      return `${currentValue === undefined ? '' : String(currentValue)}${resolveOperandDisplayValue(firstOperand, context)}`;
    default:
      return currentValue;
  }
};
