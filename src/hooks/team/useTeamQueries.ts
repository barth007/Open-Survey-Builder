
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
      console.log('Fetching teams for user in useTeamQueries:', user.id);
      try {
        const fetchedTeams = await fetchTeams(user.id);
        console.log('Teams fetched successfully:', fetchedTeams);
        return fetchedTeams;
      } catch (fetchError) {
        console.error('Error fetching teams:', fetchError);
        throw fetchError;
      }
    },
    enabled: !!user
  });
  
  const { data: teamMembers } = useQuery({
    queryKey: ['team_members', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const teamMembersMap: Record<string, any[]> = {};
      console.log(`Fetching members for ${teams.length} teams`);
      
      try {
        await Promise.all(teams.map(async (team) => {
          console.log(`Fetching members for team ${team.id} (${team.name})`);
          try {
            const members = await fetchTeamMembers(team.id);
            
            // Enhanced debug logging
            if (members && Array.isArray(members)) {
              console.log(`Team ${team.id} (${team.name}) members fetched:`, {
                count: members.length,
                memberDetails: members.map(m => ({
                  id: m.id,
                  userId: m.user_id,
                  role: m.role,
                  name: m.profile?.full_name || 'Unknown'
                }))
              });
            } else {
              console.warn(`Team ${team.id} returned invalid members data:`, members);
            }
            
            teamMembersMap[team.id] = members || [];
          } catch (memberError) {
            console.error(`Error fetching members for team ${team.id}:`, memberError);
            teamMembersMap[team.id] = [];
          }
        }));
        
        return teamMembersMap;
      } catch (fetchError) {
        console.error('Error fetching team members:', fetchError);
        throw fetchError;
      }
    },
    enabled: !!teams && teams.length > 0
  });
  
  const { data: invitations } = useQuery({
    queryKey: ['team_invitations', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const invitationsMap: Record<string, any[]> = {};
      console.log('Fetching invitations for teams:', teams);
      
      try {
        await Promise.all(teams.map(async (team) => {
          console.log(`Fetching invitations for team ${team.id}`);
          const teamInvitations = await fetchTeamInvitations(team.id);
          console.log(`Team ${team.id} invitations:`, teamInvitations);
          invitationsMap[team.id] = teamInvitations || [];
        }));
        
        return invitationsMap;
      } catch (fetchError) {
        console.error('Error fetching team invitations:', fetchError);
        throw fetchError;
      }
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
