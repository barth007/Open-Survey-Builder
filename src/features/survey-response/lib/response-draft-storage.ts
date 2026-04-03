import type { AnswerValue } from '@/types/survey';

export interface StoredResponseDraft {
  responseId: string;
  sessionToken: string;
  status?: 'draft' | 'partial' | 'submitted';
  answers?: Record<string, AnswerValue>;
  updatedAt?: string;
}

const getStorageKey = (draftKey: string) => `survey-response-draft:${draftKey}`;

export const getStoredResponseDraft = (draftKey?: string): StoredResponseDraft | null => {
  if (!draftKey || typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(getStorageKey(draftKey));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredResponseDraft;
  } catch {
    window.localStorage.removeItem(getStorageKey(draftKey));
    return null;
  }
};

export const setStoredResponseDraft = (draftKey: string | undefined, draft: StoredResponseDraft) => {
  if (!draftKey || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(draftKey), JSON.stringify(draft));
};

export const clearStoredResponseDraft = (draftKey?: string) => {
  if (!draftKey || typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getStorageKey(draftKey));
};
