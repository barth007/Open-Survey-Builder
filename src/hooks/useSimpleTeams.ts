
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { TeamRole } from '@/types/team';

// Simple type to represent a team with role information
export type SimpleTeamWithRole = {
  id: string;
  name: string;
  role: TeamRole;
  created_at: string;
};

export function useSimpleTeams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['simple-teams', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SimpleTeamWithRole[]> => {
      if (!user) return [];

      // First fetch team memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);
        
      if (membershipsError) {
        console.error('Error fetching team memberships:', membershipsError);
        return [];
      }
      
      if (!memberships || memberships.length === 0) return [];
      
      // Create a map of team IDs to roles
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map();
      
      memberships.forEach(item => {
        roleMap.set(item.team_id, item.role);
      });
      
      // Fetch team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds);
        
      if (teamsError) {
        console.error('Error fetching team details:', teamsError);
        return [];
      }
      
      if (!teams) return [];
      
      // Map team data with roles
      return teams.map(team => ({
        id: team.id,
        name: team.name,
        role: (roleMap.get(team.id) || 'viewer') as TeamRole,
        created_at: team.created_at
      }));
    },
  });

  return {
    teams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
}
