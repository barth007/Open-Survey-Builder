
// Re-export all team services from their respective modules
export { validateSession } from './team/teamAuthService';
export { fetchTeams, fetchTeamMembers, fetchTeamInvitations } from './team/teamQueryService';
export { createTeam } from './team/teamCreationService';
export { sendInvitation, processInvitation } from './team/teamInvitationService';
export { removeTeamMember, deleteTeam } from './team/teamManagementService';
