import { resolveApiEndpoint, resolveApiUrl } from '@/lib/api-url';

const getAuthToken = () => localStorage.getItem('sb_auth_token');

const buildHeaders = (options: RequestInit) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  const body = options.body;

  if (!(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(resolveApiEndpoint(endpoint), {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest(endpoint, options);
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiFetchRaw(endpoint: string, options: RequestInit = {}) {
  return apiRequest(endpoint, options);
}

export async function apiFetchBlob(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest(endpoint, options);
  return response.blob();
}

export async function apiFetchFormData(endpoint: string, formData: FormData, options: RequestInit = {}) {
  return apiFetch(endpoint, {
    ...options,
    body: formData,
  });
}

export async function fetchBackendRaw(url: string, options: RequestInit = {}) {
  const response = await fetch(resolveApiUrl(url), {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response;
}

export async function fetchBackendBlob(url: string, options: RequestInit = {}) {
  const response = await fetchBackendRaw(url, options);
  return response.blob();
}
