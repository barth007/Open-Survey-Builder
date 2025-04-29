
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

      // Use a completely different approach to avoid the deep type instantiation error
      const { data, error } = await supabase.rpc('get_user_teams', {
        user_id: user.id
      }).catch(() => {
        // Fallback to direct query if the RPC function doesn't exist
        return supabase
          .from('team_members')
          .select('role, team_id')
          .eq('user_id', user.id);
      });

      if (error) {
        console.error('Error fetching teams:', error);
        return [];
      }

      if (!data || data.length === 0) return [];
      
      // Get the team IDs to fetch team details
      const teamIds = data.map(item => item.team_id);
      const roleMap = new Map(data.map(item => [item.team_id, item.role as 'owner' | 'editor' | 'viewer']));
      
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
        role: roleMap.get(team.id) || 'viewer',
        created_at: team.created_at
      }));
    },
  });

  return {
    ...query,
    teams: query.data || []
  };
}
