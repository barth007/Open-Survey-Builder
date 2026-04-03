import type { ExpressionRuntimeContext } from './expression-runtime';
import { getFieldReferenceDisplayValue } from './expression-runtime';

const PIPE_TOKEN_REGEX = /\{\{\s*([^}|]+?)\s*(?:\|\s*([^}]+?)\s*)?\}\}/g;

const isRenderedValueEmpty = (value: string | number | undefined): boolean => (
  value === undefined || (typeof value === 'string' && value.trim().length === 0)
);

export const renderPipedText = (
  text: string | undefined,
  context: ExpressionRuntimeContext,
): string => {
  if (!text) {
    return '';
  }

  return text.replace(PIPE_TOKEN_REGEX, (_match, rawReference: string, rawFallback?: string) => {
    const renderedValue = getFieldReferenceDisplayValue(rawReference.trim(), context);

    if (!isRenderedValueEmpty(renderedValue)) {
      return String(renderedValue);
    }

    return rawFallback?.trim() ?? '';
  });
};
