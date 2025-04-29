
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export type TeamWithRole = {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
};

export function useTeams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['teams', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TeamWithRole[]> => {
      if (!user) return [];

      // Get team memberships first
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Error fetching team memberships:', membershipError);
        return [];
      }

      if (!memberships || memberships.length === 0) return [];
      
      // Get the team IDs to fetch team details
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map(
        memberships.map(item => [item.team_id, item.role as 'owner' | 'editor' | 'viewer'])
      );
      
      // Fetch teams data separately
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds);
        
      if (teamsError) {
        console.error('Error fetching team details:', teamsError);
        return [];
      }
      
      // Combine the data
      return (teamsData || []).map(team => ({
        id: team.id,
        name: team.name,
        role: (roleMap.get(team.id) || 'viewer') as 'owner' | 'editor' | 'viewer',
        created_at: team.created_at
      }));
    },
  });

  return {
    ...query,
    teams: query.data || []
  };
}
