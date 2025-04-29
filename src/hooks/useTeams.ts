
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

      // Using a simpler query structure to avoid deep type instantiation
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          role, 
          team_id,
          teams!inner (
            id, 
            name, 
            created_at 
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform the data to the expected format
      return (data || []).map(item => ({
        id: item.teams.id,
        name: item.teams.name,
        role: item.role as 'owner' | 'editor' | 'viewer',
        created_at: item.teams.created_at
      }));
    },
  });

  return {
    ...query,
    teams: query.data || []
  };
}
