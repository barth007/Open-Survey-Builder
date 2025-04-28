import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { TeamMember, TeamInvitation } from '@/types/team';

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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['team', teamId],
    enabled: !!user && !!teamId,
    queryFn: async () => {
      if (!user || !teamId) return null;

      // Carica team info
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      // Carica membri
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, role, users ( email, full_name, avatar_url )')
        .eq('team_id', teamId)
        .returns<MemberData[]>();

      if (membersError) throw membersError;

      const members: TeamMember[] = (membersData || []).map((member) => ({
        id: member.user_id,
        team_id: teamId,
        user_id: member.user_id,
        role: member.role,
        joined_at: '', // Non disponibile direttamente, puoi aggiungerlo se lo vuoi
        email: member.users?.email || '',
        full_name: member.users?.full_name || '',
        avatar_url: member.users?.avatar_url || '',
      }));

      // Carica inviti
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('id, team_id, email, role, invited_at, accepted')
        .eq('team_id', teamId)
        .returns<TeamInvitation[]>();

      if (invitationsError) throw invitationsError;

      const invitations = invitationsData || [];

      return {
        id: teamData.id,
        name: teamData.name,
        members,
        invitations,
      };
    },
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, created_by: user.id }])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  return {
    ...query,
    team: query.data,
    members: query.data?.members || [],
    invitations: query.data?.invitations || [],
    createTeam
  };
}
