
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TeamInvitation } from '@/types/team';

export function useInvitations(teamId: string) {
  return useQuery({
    queryKey: ['invitations', teamId],
    queryFn: async (): Promise<TeamInvitation[]> => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      
      // Cast the role as the correct type
      return (data || []).map(item => ({
        ...item,
        role: item.role as 'owner' | 'editor' | 'viewer'
      }));
    },
    enabled: !!teamId,
  });
}
