const DEFAULT_API_URL = '/api';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => trimTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL);

export const getApiOrigin = () => {
  const apiBaseUrl = getApiBaseUrl();

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return typeof globalThis.location?.origin === 'string' && globalThis.location.origin.length > 0
      ? globalThis.location.origin
      : '';
  }
};

export const resolveApiEndpoint = (endpoint: string) => {
  if (/^(?:https?:)?\/\//.test(endpoint)) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (normalizedEndpoint.startsWith('/api/')) {
    const origin = getApiOrigin();
    return `${origin}${normalizedEndpoint}`;
  }

  return `${getApiBaseUrl()}${normalizedEndpoint}`;
};

export const resolveApiUrl = (path: string) => {
  if (!path) {
    return path;
  }

  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiOrigin()}${normalizedPath}`;
};
