
// Re-export all team services from their respective modules
export { performDeepSessionValidation } from './team/teamAuthService';
export { 
  fetchTeams, 
  fetchTeamMembers, 
  fetchTeamInvitations,
  fetchUserInvitations 
} from './team/teamQueryService';
export { createTeam, getAuthStateDebugInfo } from './team/teamCreationService';
export { 
  sendInvitation, 
  processInvitation, 
  acceptInvitation,
  rejectInvitation 
} from './team/teamInvitationService';
export { 
  removeTeamMember, 
  deleteTeam,
  updateTeamMemberRole,
  updateTeam 
} from './team/teamManagementService';
