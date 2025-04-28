import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

type MemberData = {
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  users: {
    email: string;
    full_name: string;
    avatar_url: string;
  } | null;
};

export function useTeam(teamId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team', teamId],
    enabled: !!user && !!teamId,
    queryFn: async () => {
      if (!user || !teamId) return null;

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, role, users ( email, full_name, avatar_url )')
        .eq('team_id', teamId)
        .returns<MemberData[]>();

      if (membersError) throw membersError;

      const members = (membersData || []).map((member) => ({
        id: member.user_id,
        email: member.users ? member.users.email : '',
        full_name: member.users ? member.users.full_name : '',
        avatar_url: member.users ? member.users.avatar_url : '',
        role: member.role,
      }));

      return {
        id: teamData.id,
        name: teamData.name,
        members,
      };
    },
  });
}
