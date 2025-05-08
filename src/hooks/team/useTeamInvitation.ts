
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { 
  sendInvitation, 
  processInvitation,
  acceptInvitation,
  rejectInvitation
} from '@/services/teamService';

export function useTeamInvitation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendInvitationMutation = useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      // Make sure we're authenticated
      if (!user) throw new Error('You must be logged in to send invitations');
      
      console.log('Sending invitation for team', teamId, 'to email', email);
      return await sendInvitation(teamId, email);
    },
    onSuccess: (data, variables) => {
      console.log('Invitation sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['team_invitations'] });
      toast(`Invitation sent to ${variables.email}`);
    },
    onError: (error: Error) => {
      console.error('Failed to send invitation:', error);
      toast(`Failed to send invitation: ${error.message}`);
    }
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!user) throw new Error('You must be logged in to accept an invitation');
      
      console.log('Accepting invitation with ID:', invitationId);
      return await acceptInvitation(invitationId, user.id);
    },
    onSuccess: (data) => {
      console.log('Invitation accepted successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['user_invitations'] });
      toast('You have successfully joined the team');
    },
    onError: (error: Error) => {
      console.error('Failed to accept invitation:', error);
      toast(`Failed to accept invitation: ${error.message}`);
    }
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!user) throw new Error('You must be logged in to reject an invitation');
      
      console.log('Rejecting invitation with ID:', invitationId);
      return await rejectInvitation(invitationId);
    },
    onSuccess: () => {
      console.log('Invitation rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['user_invitations'] });
      toast('Team invitation rejected');
    },
    onError: (error: Error) => {
      console.error('Failed to reject invitation:', error);
      toast(`Failed to reject invitation: ${error.message}`);
    }
  });

  return {
    sendInvitation: sendInvitationMutation.mutate,
    acceptInvitation: acceptInvitationMutation.mutate,
    rejectInvitation: rejectInvitationMutation.mutate,
    isSending: sendInvitationMutation.isPending,
    isAccepting: acceptInvitationMutation.isPending,
    isRejecting: rejectInvitationMutation.isPending
  };
}
