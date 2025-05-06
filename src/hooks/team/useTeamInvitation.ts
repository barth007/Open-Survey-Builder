
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { sendInvitation, processInvitation } from '@/services/teamService';

export function useTeamInvitation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendInvitationMutation = useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      return await sendInvitation(teamId, email);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_invitations'] });
      toast(`Invitation sent to ${variables.email}`);
    },
    onError: (error) => {
      toast(`Failed to send invitation: ${error.message}`);
    }
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationCode: string) => {
      if (!user) throw new Error('You must be logged in to accept an invitation');
      
      return await processInvitation(invitationCode, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('You have successfully joined the team');
    },
    onError: (error) => {
      toast(`Failed to accept invitation: ${error.message}`);
    }
  });

  return {
    sendInvitation: sendInvitationMutation.mutate,
    acceptInvitation: acceptInvitationMutation.mutate
  };
}
