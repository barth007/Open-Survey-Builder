import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export type Team = {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  owner_id: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string | null;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  created_at: string | null;
  expires_at: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export const useTeams = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching teams for user:', user.id);
      
      // Use explicit column names instead of wildcards to avoid ambiguity
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          created_at,
          owner_id,
          team_members!inner(
            id,
            team_id,
            user_id,
            role,
            joined_at
          )
        `)
        .eq('team_members.user_id', user.id);
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }
      
      return data as Team[];
    },
    enabled: !!user
  });
  
  const { data: teamMembers } = useQuery({
    queryKey: ['team_members', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const teamMembersMap: Record<string, TeamMember[]> = {};
      
      await Promise.all(teams.map(async (team) => {
        // Use explicit column names for team_members and profiles
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            id,
            team_id,
            user_id,
            role,
            joined_at,
            profiles(
              full_name, 
              email, 
              avatar_url
            )
          `)
          .eq('team_id', team.id);
        
        if (error) {
          console.error(`Error fetching members for team ${team.id}:`, error);
          throw error;
        }
        
        teamMembersMap[team.id] = data as TeamMember[];
      }));
      
      return teamMembersMap;
    },
    enabled: !!teams && teams.length > 0
  });
  
  const { data: invitations } = useQuery({
    queryKey: ['team_invitations', teams],
    queryFn: async () => {
      if (!teams || teams.length === 0) return {};
      
      const invitationsMap: Record<string, TeamInvitation[]> = {};
      
      await Promise.all(teams.map(async (team) => {
        // List explicit columns for team_invitations
        const { data, error } = await supabase
          .from('team_invitations')
          .select(`
            id,
            team_id,
            email,
            created_at,
            expires_at,
            invitation_code,
            status
          `)
          .eq('team_id', team.id)
          .eq('status', 'pending');
        
        if (error) {
          console.error(`Error fetching invitations for team ${team.id}:`, error);
          throw error;
        }
        
        invitationsMap[team.id] = data as TeamInvitation[];
      }));
      
      return invitationsMap;
    },
    enabled: !!teams && teams.length > 0
  });
  
  const createTeam = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      // Enhanced authentication validation
      if (!user) throw new Error('You must be logged in to create a team');
      
      // Log authentication state for debugging
      console.log('Creating team with auth state:', { 
        userId: user.id, 
        authenticated: !!user 
      });
      
      // Get current session to ensure token is valid
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.access_token) {
        throw new Error('Valid authentication session required');
      }
      
      // FIXED: Use clean insert with simple select() to avoid any columns parameter in URL
      console.log('Executing team insert with owner_id:', user.id);
      const { data, error } = await supabase
        .from('teams')
        .insert([{ 
          name, 
          description, 
          owner_id: user.id 
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('Team created successfully');
    },
    onError: (error) => {
      toast(`Failed to create team: ${error.message}`);
    }
  });
  
  const sendInvitation = useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      // Calculate expiration date (1 week from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Generate invitation code using Supabase function
      const { data: invitationCode } = await supabase.rpc('generate_invitation_code');
      
      // Use explicit column names to avoid ambiguity
      const { data, error } = await supabase
        .from('team_invitations')
        .insert([{
          team_id: teamId,
          email,
          expires_at: expiresAt.toISOString(),
          invitation_code: invitationCode,
          status: 'pending'
        }])
        .select(`
          id,
          team_id,
          email,
          created_at,
          expires_at,
          invitation_code,
          status
        `)
        .single();
      
      if (error) {
        console.error('Error sending invitation:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_invitations'] });
      toast(`Invitation sent to ${variables.email}`);
    },
    onError: (error) => {
      toast(`Failed to send invitation: ${error.message}`);
    }
  });
  
  const acceptInvitation = useMutation({
    mutationFn: async (invitationCode: string) => {
      if (!user) throw new Error('You must be logged in to accept an invitation');
      
      // Process invitation using Supabase function
      const { data: teamId, error: processError } = await supabase
        .rpc('process_team_invitation', { invitation_code: invitationCode });
      
      if (processError) {
        console.error('Error processing invitation:', processError);
        throw processError;
      }
      
      // Add user as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        }]);
      
      if (memberError) {
        console.error('Error adding user to team:', memberError);
        throw memberError;
      }
      
      return teamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('You have successfully joined the team');
    },
    onError: (error) => {
      toast(`Failed to accept invitation: ${error.message}`);
    }
  });
  
  const removeTeamMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      if (!user) throw new Error('You must be logged in to remove team members');
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing team member:', error);
        throw error;
      }
      
      return { teamId, userId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      toast('Team member removed successfully');
    },
    onError: (error) => {
      toast(`Failed to remove team member: ${error.message}`);
    }
  });
  
  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error('You must be logged in to delete a team');
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }
      
      return teamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('Team deleted successfully');
    },
    onError: (error) => {
      toast(`Failed to delete team: ${error.message}`);
    }
  });

  return {
    teams,
    teamMembers,
    invitations,
    isLoading,
    error,
    createTeam: createTeam.mutate,
    sendInvitation: sendInvitation.mutate,
    acceptInvitation: acceptInvitation.mutate,
    removeTeamMember: removeTeamMember.mutate,
    deleteTeam: deleteTeam.mutate
  };
};
