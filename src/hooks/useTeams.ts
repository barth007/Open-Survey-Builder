
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export type TeamWithRole = {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
};

// Define specific types for database returns to avoid type inference issues
type TeamMembership = {
  team_id: string;
  role: string;
};

type TeamData = {
  id: string;
  name: string;
  created_at: string;
};

export function useTeams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['teams', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TeamWithRole[]> => {
      if (!user) return [];

      // Use explicit any typing for the query to avoid TypeScript recursion
      const membershipsResult = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);
        
      if (membershipsResult.error) {
        console.error('Error fetching team memberships:', membershipsResult.error);
        return [];
      }
      
      const memberships = membershipsResult.data as TeamMembership[];
      
      if (!memberships || memberships.length === 0) return [];
      
      // Get the team IDs to fetch team details
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map(
        memberships.map(item => [item.team_id, item.role])
      );
      
      // Use explicit any typing for teams query as well
      const teamsResult = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds);
        
      if (teamsResult.error) {
        console.error('Error fetching team details:', teamsResult.error);
        return [];
      }
      
      const teamsData = teamsResult.data as TeamData[];
      
      // Combine the data with manual type assertion
      return teamsData.map(team => {
        const role = roleMap.get(team.id) || 'viewer';
        return {
          id: team.id,
          name: team.name,
          role: role as 'owner' | 'editor' | 'viewer',
          created_at: team.created_at
        };
      });
    },
  });

  return {
    ...query,
    teams: query.data || []
  };
}
