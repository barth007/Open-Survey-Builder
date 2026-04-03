import { debugLog } from '@/lib/logger';

import { apiFetch } from '@/lib/api';
import { performDeepSessionValidation } from './teamAuthService';

export async function removeTeamMember(teamId: string, userId: string) {
  debugLog(`Removing member ${userId} from team ${teamId}`);
  await performDeepSessionValidation();

  await apiFetch(`/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });

  return { teamId, userId };
}

export async function updateTeamMemberRole(teamId: string, userId: string, newRole: 'admin' | 'member') {
  debugLog(`Updating member ${userId} role to ${newRole} in team ${teamId}`);
  await performDeepSessionValidation();

  return apiFetch(`/teams/${teamId}/members/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: newRole }),
  });
}

export async function updateTeam(teamId: string, updates: { name?: string; description?: string }) {
  debugLog(`Updating team ${teamId}:`, updates);
  await performDeepSessionValidation();

  return apiFetch(`/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTeam(teamId: string) {
  debugLog(`Deleting team ${teamId}`);
  await performDeepSessionValidation();

  await apiFetch(`/teams/${teamId}`, {
    method: 'DELETE',
  });

  return teamId;
}
