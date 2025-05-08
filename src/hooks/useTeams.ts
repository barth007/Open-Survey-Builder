
import { useTeamQueries } from './team/useTeamQueries';
import { useTeamCreation } from './team/useTeamCreation';
import { useTeamInvitation } from './team/useTeamInvitation';
import { useTeamManagement } from './team/useTeamManagement';
import { useUserInvitations } from './team/useUserInvitations';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

export type { Team, TeamMember, TeamInvitation };

export const useTeams = () => {
  const { teams, teamMembers, invitations, isLoading, error } = useTeamQueries();
  const { 
    receivedInvitations, 
    isLoading: isLoadingReceivedInvitations 
  } = useUserInvitations();
  const { 
    sendInvitation, 
    acceptInvitation, 
    rejectInvitation, 
    isSending, 
    isAccepting,
    isRejecting 
  } = useTeamInvitation();
  const { 
    removeTeamMember, 
    updateTeamMemberRole, 
    updateTeam,
    deleteTeam 
  } = useTeamManagement();
  const { mutate: createTeam } = useTeamCreation();

  return {
    teams,
    teamMembers,
    invitations,
    receivedInvitations,
    isLoading: isLoading || isLoadingReceivedInvitations,
    error,
    createTeam,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    removeTeamMember,
    updateTeamMemberRole,
    updateTeam,
    deleteTeam,
    isSending,
    isAccepting,
    isRejecting
  };
};
