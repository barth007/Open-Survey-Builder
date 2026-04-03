import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch, resolveApiUrl, toast } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  resolveApiUrl: vi.fn((path: string) => `https://example.test${path}`),
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch,
}));

vi.mock('@/lib/api-url', () => ({
  resolveApiUrl,
}));

vi.mock('@/components/ui/sonner', () => ({
  toast,
}));

import {
  fetchCapabilities,
  getCapabilitiesSnapshot,
  normalizeCapabilitiesResponse,
  resetCapabilitiesSnapshot,
  setCapabilitiesSnapshot,
} from '@/hooks/useCapabilities';
import { signInWithGoogle } from '@/providers/auth/authService';
import { DEFAULT_CAPABILITIES, type CapabilityMap } from '@/types/capabilities';
import {
  getBlockDefinition,
  isBlockAvailable,
} from '@/features/survey-editor/lib/editor-blocks';

const buildCapabilities = (overrides: Partial<CapabilityMap> = {}): CapabilityMap => ({
  ...DEFAULT_CAPABILITIES,
  ...overrides,
});

describe('capability contract gating', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    resolveApiUrl.mockClear();
    toast.mockClear();
    toast.error.mockClear();
    toast.success.mockClear();
    toast.info.mockClear();
    resetCapabilitiesSnapshot();
  });

  it('normalizes the backend capability payload and fills in defaults', () => {
    const normalized = normalizeCapabilitiesResponse({
      googleAuth: { enabled: true, reason: 'Configured' },
      payment: { enabled: false },
      recaptcha: null,
    });

    expect(normalized.googleAuth).toEqual({ enabled: true, reason: 'Configured' });
    expect(normalized.payment).toEqual(DEFAULT_CAPABILITIES.payment);
    expect(normalized.recaptcha).toEqual(DEFAULT_CAPABILITIES.recaptcha);
    expect(normalized.twoFactor).toEqual(DEFAULT_CAPABILITIES.twoFactor);
  });

  it('caches fetched capabilities for later UI checks', async () => {
    apiFetch.mockResolvedValue({
      googleAuth: { enabled: true, reason: 'Google auth is available.' },
      passwordReset: { enabled: false, reason: 'Password reset is disabled.' },
      twoFactor: { enabled: false },
      accountExport: { enabled: true },
      accountDeletion: { enabled: true },
      payment: { enabled: true, reason: 'Payment is enabled.' },
      recaptcha: { enabled: false },
    });

    const capabilities = await fetchCapabilities();

    expect(capabilities.googleAuth.enabled).toBe(true);
    expect(getCapabilitiesSnapshot().googleAuth.enabled).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith('/system/capabilities');
  });

  it('blocks google sign-in when the backend capability is disabled', async () => {
    apiFetch.mockResolvedValue(buildCapabilities({
      googleAuth: { enabled: false, reason: 'Google OAuth is not configured.' },
    }));

    await expect(signInWithGoogle()).rejects.toThrow('Google OAuth is not configured.');
    expect(toast.error).toHaveBeenCalledWith('Google OAuth is not configured.');
    expect(resolveApiUrl).not.toHaveBeenCalled();
  });

  it('enables provider-backed editor blocks when the capability contract allows them', () => {
    setCapabilitiesSnapshot(buildCapabilities({
      payment: { enabled: true, reason: 'Payment is configured.' },
      recaptcha: { enabled: true, reason: 'reCAPTCHA is configured.' },
    }));

    const paymentBlock = getBlockDefinition('payment');
    const recaptchaBlock = getBlockDefinition('recaptcha');

    expect(isBlockAvailable(paymentBlock)).toBe(true);
    expect(isBlockAvailable(recaptchaBlock)).toBe(true);
    expect(paymentBlock.unavailableReason).toBeUndefined();
    expect(recaptchaBlock.unavailableReason).toBeUndefined();
  });
});
