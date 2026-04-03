import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch, toast } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch,
}));

vi.mock('@/components/ui/sonner', () => ({
  toast,
}));

import { checkApprovalStatus, refreshSession } from '@/providers/auth/authService';
import type { ApprovalStatus, StatusCache } from '@/providers/auth/types';

class LocalStorageMock {
  private store = new Map<string, string>();

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  get length() {
    return this.store.size;
  }
}

const statusCacheRef = {
  current: {
    status: 'unknown',
    timestamp: 0,
    attemptCount: 0,
  },
} as React.MutableRefObject<StatusCache>;

const checkingStatusRef = {
  current: false,
} as React.MutableRefObject<boolean>;

describe('auth service', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
      configurable: true,
    });
  });

  it('refreshes the session by validating the stored token against the backend profile', async () => {
    localStorage.setItem('sb_auth_token', 'token-123');
    apiFetch.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      status: 'approved',
      role: 'user',
    });

    const refreshed = await refreshSession();

    expect(refreshed).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith('/auth/profile');
    expect(JSON.parse(localStorage.getItem('sb_user') || '{}')).toMatchObject({
      id: 'user-1',
      status: 'approved',
    });
  });

  it('clears stale local auth state when backend profile validation fails', async () => {
    localStorage.setItem('sb_auth_token', 'bad-token');
    localStorage.setItem('sb_user', JSON.stringify({ id: 'user-1', status: 'approved' }));
    apiFetch.mockRejectedValue(new Error('Invalid token'));

    const refreshed = await refreshSession();

    expect(refreshed).toBe(false);
    expect(localStorage.getItem('sb_auth_token')).toBeNull();
    expect(localStorage.getItem('sb_user')).toBeNull();
  });

  it('checks approval status from the backend instead of trusting cached local storage', async () => {
    localStorage.setItem('sb_auth_token', 'token-123');
    localStorage.setItem('sb_user', JSON.stringify({ id: 'user-1', status: 'pending' }));
    apiFetch.mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      status: 'approved',
      role: 'user',
    });
    const setApprovalStatus = vi.fn();

    const status = await checkApprovalStatus(
      'user-1',
      statusCacheRef,
      checkingStatusRef,
      setApprovalStatus,
    );

    expect(status).toBe('approved');
    expect(apiFetch).toHaveBeenCalledWith('/auth/profile');
    expect(setApprovalStatus).toHaveBeenCalledWith('approved');
  });

  it('returns unknown when no user id is available', async () => {
    const setApprovalStatus = vi.fn();

    const status = await checkApprovalStatus(
      undefined,
      statusCacheRef,
      checkingStatusRef,
      setApprovalStatus,
    );

    expect(status).toBe('unknown');
    expect(apiFetch).not.toHaveBeenCalled();
    expect(setApprovalStatus).not.toHaveBeenCalled();
  });
});
