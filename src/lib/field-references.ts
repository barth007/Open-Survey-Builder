export type FieldReferenceKind = 'question' | 'hidden' | 'computed' | 'meta';

export interface ParsedFieldReference {
  kind: FieldReferenceKind;
  key: string;
}

const FIELD_REFERENCE_KINDS: FieldReferenceKind[] = ['question', 'hidden', 'computed', 'meta'];

export const parseFieldReference = (value: string): ParsedFieldReference | null => {
  const trimmedValue = value.trim();
  const separatorIndex = trimmedValue.indexOf(':');

  if (separatorIndex <= 0) {
    return null;
  }

  const kind = trimmedValue.slice(0, separatorIndex) as FieldReferenceKind;
  const key = trimmedValue.slice(separatorIndex + 1).trim();

  if (!FIELD_REFERENCE_KINDS.includes(kind) || key.length === 0) {
    return null;
  }

  return {
    kind,
    key,
  };
};

export const isFieldReference = (value: string): boolean => parseFieldReference(value) !== null;

export const toQuestionFieldReference = (value: string): string => (
  isFieldReference(value) ? value : `question:${value.trim()}`
);
