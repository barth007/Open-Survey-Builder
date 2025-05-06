
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { 
  removeTeamMember, 
  deleteTeam, 
  updateTeamMemberRole,
  updateTeam
} from '@/services/teamService';
import { TeamMember } from '@/types/team-types';

export function useTeamManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      if (!user) throw new Error('You must be logged in to remove team members');
      
      return await removeTeamMember(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      toast('Team member removed successfully');
    },
    onError: (error) => {
      toast(`Failed to remove team member: ${error.message}`);
    }
  });

  const updateTeamMemberRoleMutation = useMutation({
    mutationFn: async ({ 
      teamId, 
      userId, 
      newRole 
    }: { 
      teamId: string; 
      userId: string; 
      newRole: 'admin' | 'member' 
    }) => {
      if (!user) throw new Error('You must be logged in to update member roles');
      
      return await updateTeamMemberRole(teamId, userId, newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      toast('Member role updated successfully');
    },
    onError: (error) => {
      toast(`Failed to update member role: ${error.message}`);
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ 
      teamId, 
      updates 
    }: { 
      teamId: string; 
      updates: { name?: string; description?: string } 
    }) => {
      if (!user) throw new Error('You must be logged in to update team details');
      
      return await updateTeam(teamId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('Team updated successfully');
    },
    onError: (error) => {
      toast(`Failed to update team: ${error.message}`);
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error('You must be logged in to delete a team');
      
      return await deleteTeam(teamId);
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
    removeTeamMember: removeTeamMemberMutation.mutate,
    updateTeamMemberRole: updateTeamMemberRoleMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate
  };
}
