
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

      // We'll fetch team memberships as plain objects to avoid the type instantiation issue
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)
        .returns<{ team_id: string; role: string }[]>();

      if (membershipError) {
        console.error('Error fetching team memberships:', membershipError);
        return [];
      }

      if (!memberships || memberships.length === 0) return [];
      
      // Get the team IDs to fetch team details
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map(
        memberships.map(item => [item.team_id, item.role])
      );
      
      // Fetch teams data separately with explicit return type
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds)
        .returns<{ id: string; name: string; created_at: string }[]>();
        
      if (teamsError) {
        console.error('Error fetching team details:', teamsError);
        return [];
      }
      
      // Combine the data with explicit type casting
      return (teamsData || []).map(team => {
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
