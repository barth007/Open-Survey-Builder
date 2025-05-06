
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { removeTeamMember, deleteTeam } from '@/services/teamService';

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
    deleteTeam: deleteTeamMutation.mutate
  };
}
