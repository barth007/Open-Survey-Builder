import { debugLog } from '@/lib/logger';
import { apiFetch } from '@/lib/api';

/**
 * Performs a backend-backed session validation.
 */
export async function performDeepSessionValidation() {
  const profile = await apiFetch('/auth/profile') as { id: string };
  debugLog('Auth validation successful:', profile.id);
  return profile.id;
}
