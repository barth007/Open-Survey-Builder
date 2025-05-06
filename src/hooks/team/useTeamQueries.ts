
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { fetchTeams, fetchTeamMembers, fetchTeamInvitations } from '@/services/teamService';
import { Team } from '@/types/team-types';

export function useTeamQueries() {
  const { user } = useAuth();

  const { 
    data: teams, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await fetchTeams(user.id);
    },
    enabled: !!user
  });
  
  const { data: teamMembers } = useQuery({
    queryKey: ['team_members', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const teamMembersMap: Record<string, any[]> = {};
      
      await Promise.all(teams.map(async (team) => {
        const members = await fetchTeamMembers(team.id);
        teamMembersMap[team.id] = members;
      }));
      
      return teamMembersMap;
    },
    enabled: !!teams && teams.length > 0
  });
  
  const { data: invitations } = useQuery({
    queryKey: ['team_invitations', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const invitationsMap: Record<string, any[]> = {};
      
      await Promise.all(teams.map(async (team) => {
        const teamInvitations = await fetchTeamInvitations(team.id);
        invitationsMap[team.id] = teamInvitations;
      }));
      
      return invitationsMap;
    },
    enabled: !!teams && teams.length > 0
  });

  return {
    teams,
    teamMembers,
    invitations,
    isLoading,
    error
  };
}
