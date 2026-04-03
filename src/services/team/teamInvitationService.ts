import { apiFetch } from '@/lib/api';

export async function sendInvitation(teamId: string, email: string) {
  return apiFetch(`/teams/${teamId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function processInvitation(_invitationCode: string, _userId: string) {
  throw new Error('Invitation processing is handled through invitation IDs in the current backend');
}

export async function acceptInvitation(invitationId: string, _userId: string) {
  return apiFetch(`/invitations/${invitationId}/accept`, {
    method: 'POST',
  });
}

export async function rejectInvitation(invitationId: string) {
  return apiFetch(`/invitations/${invitationId}/reject`, {
    method: 'POST',
  });
}
