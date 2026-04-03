import type { HiddenFieldDefinition } from '@/types/survey';

export const resolveHiddenFieldValues = (
  hiddenFields: HiddenFieldDefinition[] = [],
  searchParams: URLSearchParams,
) => hiddenFields.reduce<Record<string, string>>((acc, field) => {
  const key = field.key?.trim();

  if (!key) {
    return acc;
  }

  const queryValue = searchParams.get(key);
  const shouldUseQuery = field.allowQueryOverride && typeof queryValue === 'string' && queryValue.length > 0;
  const resolvedValue = shouldUseQuery ? queryValue : field.defaultValue?.trim();

  if (resolvedValue) {
    acc[key] = resolvedValue;
  }

  return acc;
}, {});

export const buildHiddenFieldMetadata = (hiddenFieldValues: Record<string, string>) => (
  Object.keys(hiddenFieldValues).length > 0
    ? {
      hiddenFields: hiddenFieldValues,
    }
    : {}
);
