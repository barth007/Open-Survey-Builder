export const QUESTION_SETTINGS_PORTAL_ATTR = 'data-question-settings-owned';
export const QUESTION_SETTINGS_PORTAL_VALUE = 'true';
export const QUESTION_SETTINGS_PORTAL_SELECTOR = `[${QUESTION_SETTINGS_PORTAL_ATTR}="${QUESTION_SETTINGS_PORTAL_VALUE}"]`;

export const getQuestionSettingsPortalProps = () =>
  ({
    [QUESTION_SETTINGS_PORTAL_ATTR]: QUESTION_SETTINGS_PORTAL_VALUE,
  }) as const;

export const isQuestionSettingsOwnedTarget = (
  root: Pick<Node, 'contains'> | null | undefined,
  target: EventTarget | null,
) => {
  if (!target) {
    return false;
  }

  if (root?.contains(target as Node)) {
    return true;
  }

  if (typeof (target as Element).closest === 'function') {
    return Boolean((target as Element).closest(QUESTION_SETTINGS_PORTAL_SELECTOR));
  }

  return false;
};
