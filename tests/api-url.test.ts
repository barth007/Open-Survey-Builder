import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, resolveApiEndpoint, resolveApiUrl } from '@/lib/api-url';

describe('resolveApiUrl', () => {
  it('defaults the frontend api base url to a same-origin relative /api path', () => {
    expect(getApiBaseUrl()).toBe('/api');
  });

  it('keeps relative media urls relative when no explicit backend origin is configured', () => {
    expect(resolveApiUrl('/uploads/x.webm')).toBe('/uploads/x.webm');
  });

  it('resolves api endpoints against the relative /api base by default', () => {
    expect(resolveApiEndpoint('/auth/profile')).toBe('/api/auth/profile');
  });

  it('returns absolute urls unchanged', () => {
    expect(resolveApiUrl('https://cdn.example.com/file.webm')).toBe('https://cdn.example.com/file.webm');
  });
});
