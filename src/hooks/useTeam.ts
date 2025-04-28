
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember } from '@/types/team';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

export function useTeam(teamId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId,
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User must be logged in to create a team');
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{ 
          name, 
          created_by: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      
      // After creating the team, add the current user as an owner
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id,
          role: 'owner'
        }]);
        
      if (memberError) throw memberError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to create team');
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role: TeamMember['role'] }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{ team_id: teamId, user_id: userId, role }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member added successfully');
    },
    onError: (error) => {
      setError(error.message);
      toast.error('Failed to add team member');
    },
  });

  return {
    team,
    members,
    isLoading: isLoadingTeam || isLoadingMembers,
    error,
    createTeam,
    addMember,
  };
}
