
import { useTeamQueries } from './team/useTeamQueries';
import { useTeamCreation } from './team/useTeamCreation';
import { useTeamInvitation } from './team/useTeamInvitation';
import { useTeamManagement } from './team/useTeamManagement';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

export type { Team, TeamMember, TeamInvitation };

export const useTeams = () => {
  const { teams, teamMembers, invitations, isLoading, error } = useTeamQueries();
  const { sendInvitation, acceptInvitation } = useTeamInvitation();
  const { removeTeamMember, deleteTeam } = useTeamManagement();
  const { mutate: createTeam } = useTeamCreation();

  return {
    teams,
    teamMembers,
    invitations,
    isLoading,
    error,
    createTeam,
    sendInvitation,
    acceptInvitation,
    removeTeamMember,
    deleteTeam
  };
};
