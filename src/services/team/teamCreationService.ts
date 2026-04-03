import { debugLog } from '@/lib/logger';

import { apiFetch } from '@/lib/api';
import { performDeepSessionValidation } from './teamAuthService';

export async function createTeam(_userId: string, name: string, description?: string) {
  debugLog('Creating team via backend API:', { name, description });
  await performDeepSessionValidation();

  return apiFetch('/teams', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function getAuthStateDebugInfo() {
  const token = localStorage.getItem('sb_auth_token');

  try {
    const profile = token ? await apiFetch('/auth/profile') : null;

    return {
      hasSession: Boolean(token),
      userId: (profile as { id?: string } | null)?.id || null,
      authHeader: Boolean(token),
      jwtLength: token?.length || 0,
    };
  } catch (error) {
    return {
      hasSession: Boolean(token),
      error: (error as Error).message,
    };
  }
}
