type ErrorLike = {
  message?: unknown;
};

const isErrorLike = (value: unknown): value is ErrorLike => (
  typeof value === 'object' &&
  value !== null &&
  'message' in value
);

export const getErrorMessage = (
  error: unknown,
  fallback = 'Unknown error'
): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (isErrorLike(error) && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
