import { apiFetch } from '@/lib/api';

export type SurveyInsightEventType = 'form_view' | 'form_start' | 'question_reached' | 'form_submit';

const getStorageKey = (publicCode: string) => `survey-insights-session:${publicCode}`;

export const getOrCreateInsightsSessionId = (publicCode: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  const existingSessionId = window.sessionStorage.getItem(getStorageKey(publicCode));
  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${publicCode}-${Date.now()}`;

  window.sessionStorage.setItem(getStorageKey(publicCode), nextSessionId);
  return nextSessionId;
};

export const trackSurveyInsight = async (
  publicCode: string,
  payload: {
    sessionId: string;
    eventType: SurveyInsightEventType;
    questionId?: string;
    pageIndex?: number;
    metadata?: Record<string, unknown>;
  },
) => {
  if (!publicCode || !payload.sessionId) {
    return;
  }

  try {
    await apiFetch(`/surveys/public/${publicCode}/insights`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to track survey insight:', error);
  }
};
