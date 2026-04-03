import type { SurveySettings } from '@/types/survey';

export const getEffectiveCompletionRedirect = (survey: {
  redirectUrl?: string;
  settings?: SurveySettings;
}) => {
  const settingsRedirect = survey.settings?.completion?.redirectUrl?.trim();

  if (settingsRedirect) {
    return settingsRedirect;
  }

  return survey.redirectUrl?.trim() || '';
};

export const getClosedFormContent = (
  settings?: SurveySettings,
  now = new Date(),
) => {
  const access = settings?.access;

  if (!access) {
    return null;
  }

  const closeAt = access.closeAt ? new Date(access.closeAt) : null;
  const isScheduledClosed = Boolean(
    closeAt &&
    !Number.isNaN(closeAt.getTime()) &&
    closeAt.getTime() <= now.getTime(),
  );

  if (!access.isClosed && !isScheduledClosed) {
    return null;
  }

  const title = access.closedMessage?.title?.trim() || 'This form is closed';
  const description = access.closedMessage?.description?.trim()
    || (isScheduledClosed
      ? 'This form is no longer accepting responses.'
      : 'This form is currently not accepting responses.');

  return {
    title,
    description,
  };
};
