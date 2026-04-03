import { apiFetch } from '@/lib/api';

const PUBLIC_FORM_ACCESS_STORAGE_PREFIX = 'sb_public_form_access_';
const PUBLIC_FORM_ACCESS_HEADER = 'x-form-access-token';

const getStorageKey = (publicCode: string) => `${PUBLIC_FORM_ACCESS_STORAGE_PREFIX}${publicCode}`;

export const getStoredPublicFormAccessToken = (publicCode: string) => {
  if (typeof window === 'undefined' || !publicCode) {
    return '';
  }

  return window.sessionStorage.getItem(getStorageKey(publicCode)) || '';
};

export const setStoredPublicFormAccessToken = (publicCode: string, token: string) => {
  if (typeof window === 'undefined' || !publicCode) {
    return;
  }

  window.sessionStorage.setItem(getStorageKey(publicCode), token);
};

export const clearStoredPublicFormAccessToken = (publicCode: string) => {
  if (typeof window === 'undefined' || !publicCode) {
    return;
  }

  window.sessionStorage.removeItem(getStorageKey(publicCode));
};

export const buildPublicFormAccessHeaders = (accessToken?: string) => (
  accessToken
    ? {
      [PUBLIC_FORM_ACCESS_HEADER]: accessToken,
    }
    : undefined
);

export const unlockPublicForm = async (publicCode: string, password: string) => {
  return apiFetch(`/surveys/public/${publicCode}/access`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }) as Promise<{ accessToken: string }>;
};
