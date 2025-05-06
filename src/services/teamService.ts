
// Re-export all team services from their respective modules
export { performDeepSessionValidation } from './team/teamAuthService';
export { fetchTeams, fetchTeamMembers, fetchTeamInvitations } from './team/teamQueryService';
export { createTeam, getAuthStateDebugInfo } from './team/teamCreationService';
export { sendInvitation, processInvitation } from './team/teamInvitationService';
export { 
  removeTeamMember, 
  deleteTeam,
  updateTeamMemberRole,
  updateTeam 
} from './team/teamManagementService';
