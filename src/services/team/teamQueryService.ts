import { debugLog } from '@/lib/logger';

import { apiFetch } from '@/lib/api';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

export async function fetchTeams(_userId: string): Promise<Team[]> {
  debugLog('Fetching teams via backend API');
  return apiFetch('/teams') as Promise<Team[]>;
}

export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  debugLog(`Fetching team members for team ${teamId}`);
  return apiFetch(`/teams/${teamId}/members`) as Promise<TeamMember[]>;
}

export async function fetchTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  debugLog(`Fetching invitations for team ${teamId}`);
  return apiFetch(`/teams/${teamId}/invitations`) as Promise<TeamInvitation[]>;
}

export async function fetchUserInvitations(_userEmail: string): Promise<TeamInvitation[]> {
  debugLog('Fetching invitations for current authenticated user');
  return apiFetch('/invitations') as Promise<TeamInvitation[]>;
}
