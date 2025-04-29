
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

// Define simple raw types to avoid complex type inference
type RawTeamMembership = {
  team_id: string | null;
  role: string;
};

type RawTeam = {
  id: string;
  name: string;
  created_at: string;
};

export function useSimpleTeams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['simple-teams', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SimpleTeamWithRole[]> => {
      if (!user) return [];

      try {
        // First fetch team memberships with explicit type casting
        const membershipsResult = await supabase
          .from('team_members')
          .select('team_id, role')
          .eq('user_id', user.id);
          
        if (membershipsResult.error) {
          console.error('Error fetching team memberships:', membershipsResult.error);
          return [];
        }
        
        // Explicit casting to avoid type inference issues
        const memberships = membershipsResult.data as RawTeamMembership[];
        
        if (!memberships || memberships.length === 0) return [];
        
        // Filter out null team_ids and create a map of team IDs to roles
        const teamIds = memberships
          .filter(item => item.team_id !== null)
          .map(item => item.team_id as string);
        
        if (teamIds.length === 0) return [];
        
        const roleMap = new Map<string, string>();
        memberships.forEach(item => {
          if (item.team_id) {
            roleMap.set(item.team_id, item.role);
          }
        });
        
        // Fetch team details with explicit type casting
        const teamsResult = await supabase
          .from('teams')
          .select('id, name, created_at')
          .in('id', teamIds);
          
        if (teamsResult.error) {
          console.error('Error fetching team details:', teamsResult.error);
          return [];
        }
        
        // Explicit casting to avoid type inference issues
        const teams = teamsResult.data as RawTeam[];
        
        if (!teams) return [];
        
        // Map team data with roles using explicit return type
        return teams.map(team => {
          const role = roleMap.get(team.id) || 'viewer';
          return {
            id: team.id,
            name: team.name,
            role: role as TeamRole,
            created_at: team.created_at
          };
        });
      } catch (error) {
        console.error('Unexpected error in useSimpleTeams:', error);
        return [];
      }
    },
  });

  return {
    teams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
}
