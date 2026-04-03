import type {
  AnswerValue,
  FileUploadAnswerValue,
  MatrixAnswerValue,
  PaymentAnswerValue,
  Question,
  RankingAnswerValue,
  SignatureAnswerValue,
  UploadedFileValue,
  VerificationAnswerValue,
} from '@/types/survey';

const encodeArrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

const buildOptionLabelMap = (question: Question): Map<string, string> =>
  new Map(question.options.map((option) => [option.id, option.text]));

const buildMatrixColumnLabelMap = (question: Question): Map<string, string> =>
  new Map((question.matrixColumns || []).map((option) => [option.id, option.text]));

export const isRankingAnswerValue = (value: AnswerValue | undefined): value is RankingAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'ranking';

export const isMatrixAnswerValue = (value: AnswerValue | undefined): value is MatrixAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'matrix';

export const isFileUploadAnswerValue = (value: AnswerValue | undefined): value is FileUploadAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'fileUpload';

export const isSignatureAnswerValue = (value: AnswerValue | undefined): value is SignatureAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'signature';

export const isVerificationAnswerValue = (value: AnswerValue | undefined): value is VerificationAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'verification';

export const isPaymentAnswerValue = (value: AnswerValue | undefined): value is PaymentAnswerValue =>
  typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'payment';

export const isAnswerValueEmpty = (value: AnswerValue | undefined): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isRankingAnswerValue(value)) {
    return value.orderedOptionIds.length === 0;
  }

  if (isMatrixAnswerValue(value)) {
    return Object.keys(value.selections).length === 0;
  }

  if (isFileUploadAnswerValue(value)) {
    return value.files.length === 0;
  }

  if (isSignatureAnswerValue(value)) {
    return value.dataUrl.trim() === '';
  }

  if (isVerificationAnswerValue(value)) {
    return !value.verified;
  }

  if (isPaymentAnswerValue(value)) {
    return !value.confirmed;
  }

  return false;
};

export const validateRequiredAnswer = (
  question: Question,
  value: AnswerValue | undefined,
): string | null => {
  if (!question.isRequired) {
    return null;
  }

  if (value === undefined || isAnswerValueEmpty(value)) {
    if (question.type === 'recaptcha') {
      return 'Please complete the verification step.';
    }

    if (question.type === 'payment') {
      return 'Please confirm the payment step.';
    }

    return 'This field is required.';
  }

  if (question.type === 'matrix' && isMatrixAnswerValue(value)) {
    const totalRows = question.options.length;
    const answeredRows = Object.keys(value.selections).length;

    if (answeredRows < totalRows) {
      return 'Please answer each row.';
    }
  }

  if (question.type === 'ranking' && isRankingAnswerValue(value)) {
    if (value.orderedOptionIds.length < question.options.length) {
      return 'Please complete the ranking.';
    }
  }

  return null;
};

export const getAnswerAnalyticsValues = (
  question: Question,
  value: AnswerValue | undefined,
): string[] => {
  if (value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (isRankingAnswerValue(value)) {
    const optionMap = buildOptionLabelMap(question);
    const labels = value.orderedOptionIds.map((optionId, index) => `${index + 1}. ${optionMap.get(optionId) || optionId}`);
    return labels.length > 0 ? [labels.join(' > ')] : [];
  }

  if (isMatrixAnswerValue(value)) {
    const rowMap = buildOptionLabelMap(question);
    const columnMap = buildMatrixColumnLabelMap(question);

    return Object.entries(value.selections).map(([rowId, columnId]) => {
      const rowLabel = rowMap.get(rowId) || rowId;
      const columnLabel = columnMap.get(columnId) || columnId;
      return `${rowLabel}: ${columnLabel}`;
    });
  }

  if (isFileUploadAnswerValue(value)) {
    return value.files.length > 0
      ? value.files.map((file) => file.name)
      : [];
  }

  if (isSignatureAnswerValue(value)) {
    return ['Signed'];
  }

  if (isVerificationAnswerValue(value)) {
    return [value.verified ? 'Verified' : 'Not verified'];
  }

  if (isPaymentAnswerValue(value)) {
    return [value.confirmed ? 'Payment confirmed' : 'Payment pending'];
  }

  return [];
};

export const serializeFilesForAnswer = async (
  files: File[] | FileList,
  maxBytes = 2 * 1024 * 1024,
): Promise<FileUploadAnswerValue> => {
  const fileArray = Array.from(files);
  const serializedFiles: UploadedFileValue[] = [];

  for (const file of fileArray) {
    if (file.size > maxBytes) {
      throw new Error(`"${file.name}" exceeds the ${Math.round(maxBytes / (1024 * 1024))} MB limit.`);
    }

    const base64 = encodeArrayBufferToBase64(await file.arrayBuffer());
    serializedFiles.push({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      dataUrl: `data:${file.type || 'application/octet-stream'};base64,${base64}`,
    });
  }

  return {
    kind: 'fileUpload',
    files: serializedFiles,
  };
};

export const getFirstValidationError = (
  questions: Question[],
  answers: Record<string, AnswerValue>,
): { questionId: string; message: string } | null => {
  for (const question of questions) {
    const error = validateRequiredAnswer(question, answers[question.id]);
    if (error) {
      return {
        questionId: question.id,
        message: error,
      };
    }
  }

  return null;
};
