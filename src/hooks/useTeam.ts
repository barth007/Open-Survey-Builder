
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { TeamMember, TeamInvitation } from '@/types/team';

export function useTeam(teamId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['team', teamId],
    enabled: !!user && !!teamId,
    queryFn: async () => {
      if (!user || !teamId) return null;

      // Load team info
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      // Load members with simplified query to avoid type instantiation error
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id, 
          email, 
          role, 
          joined_at
        `)
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Transform member data
      const members: TeamMember[] = (membersData || []).map(member => ({
        id: member.id,
        team_id: teamId,
        user_id: '', // Provide a default empty string since user_id doesn't exist in query result
        role: member.role as 'owner' | 'editor' | 'viewer',
        joined_at: member.joined_at || '',
        email: member.email || '',
        full_name: '', // Will need to join with profiles to get this
        avatar_url: '', // Will need to join with profiles to get this
      }));

      // Load invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('id, team_id, email, role, invited_at, accepted')
        .eq('team_id', teamId);

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
