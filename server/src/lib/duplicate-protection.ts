interface DuplicateProtectionSettings {
  enabled?: boolean;
  uniqueFieldRef?: string;
  appliesTo?: 'submitted' | 'submitted_and_partial';
}

interface AnswerRecord {
  questionId?: string;
  value?: unknown;
}

interface SurveyResponseCandidate {
  id: string;
  status?: string | null;
  answers?: unknown;
  metadata?: unknown;
  participantId?: string | null;
}

interface DuplicateCheckInput {
  survey: { settings?: unknown };
  currentResponseId?: string;
  answers?: unknown;
  metadata?: unknown;
  participantId?: string | null;
  existingResponses: SurveyResponseCandidate[];
}

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const getSettingsRecord = (survey: { settings?: unknown }) => (
  isJsonRecord(survey.settings) ? survey.settings : undefined
);

const getDuplicateSettings = (survey: { settings?: unknown }): DuplicateProtectionSettings | undefined => {
  const access = getSettingsRecord(survey)?.access;

  if (!isJsonRecord(access) || !isJsonRecord(access.duplicateProtection)) {
    return undefined;
  }

  return access.duplicateProtection as DuplicateProtectionSettings;
};

export const isDuplicateProtectionEnabled = (survey: { settings?: unknown }) => {
  const settings = getDuplicateSettings(survey);

  return Boolean(settings?.enabled && settings.uniqueFieldRef?.trim());
};

export const shouldPreventDuplicateOnPartialSave = (survey: { settings?: unknown }) => {
  const settings = getDuplicateSettings(survey);

  return Boolean(
    settings?.enabled &&
    settings.uniqueFieldRef?.trim() &&
    settings.appliesTo === 'submitted_and_partial',
  );
};

const normalizeValue = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : null;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return null;
};

const getAnswerValue = (answers: unknown, questionId: string) => {
  if (!Array.isArray(answers)) {
    return undefined;
  }

  const answer = answers.find((entry) => isJsonRecord(entry) && entry.questionId === questionId) as AnswerRecord | undefined;
  return answer?.value;
};

const getMetadataRecord = (metadata: unknown) => (
  isJsonRecord(metadata) ? metadata : undefined
);

const resolveUniqueValue = (
  fieldRef: string | undefined,
  input: {
    answers?: unknown;
    metadata?: unknown;
    participantId?: string | null;
  },
) => {
  if (!fieldRef) {
    return null;
  }

  const trimmedFieldRef = fieldRef.trim();
  const metadata = getMetadataRecord(input.metadata);

  if (trimmedFieldRef.startsWith('question:')) {
    return normalizeValue(getAnswerValue(input.answers, trimmedFieldRef.slice('question:'.length)));
  }

  if (trimmedFieldRef.startsWith('hidden:')) {
    const hiddenFields = getMetadataRecord(metadata?.hiddenFields);
    return normalizeValue(hiddenFields?.[trimmedFieldRef.slice('hidden:'.length)]);
  }

  if (trimmedFieldRef.startsWith('computed:')) {
    const computedFields = getMetadataRecord(metadata?.computedFields);
    return normalizeValue(computedFields?.[trimmedFieldRef.slice('computed:'.length)]);
  }

  if (trimmedFieldRef === 'meta:respondentId') {
    return normalizeValue(input.participantId);
  }

  return normalizeValue(getAnswerValue(input.answers, trimmedFieldRef));
};

const matchesProtectedStatus = (
  appliesTo: DuplicateProtectionSettings['appliesTo'],
  status: string | null | undefined,
) => {
  if (appliesTo === 'submitted_and_partial') {
    return status === 'submitted' || status === 'partial' || status === 'draft';
  }

  return status === 'submitted';
};

export const hasDuplicateSubmission = ({
  survey,
  currentResponseId,
  answers,
  metadata,
  participantId,
  existingResponses,
}: DuplicateCheckInput) => {
  const settings = getDuplicateSettings(survey);

  if (!settings?.enabled || !settings.uniqueFieldRef) {
    return false;
  }

  const currentValue = resolveUniqueValue(settings.uniqueFieldRef, {
    answers,
    metadata,
    participantId,
  });

  if (!currentValue) {
    return false;
  }

  return existingResponses.some((response) => {
    if (response.id === currentResponseId || !matchesProtectedStatus(settings.appliesTo, response.status)) {
      return false;
    }

    const candidateValue = resolveUniqueValue(settings.uniqueFieldRef, {
      answers: response.answers,
      metadata: response.metadata,
      participantId: response.participantId,
    });

    return candidateValue === currentValue;
  });
};
