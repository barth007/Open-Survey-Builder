
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { createTeam, validateSession } from '@/services/teamService';

export function useTeamCreation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      // Enhanced authentication validation
      if (!user) throw new Error('You must be logged in to create a team');
      
      // Log authentication state for debugging
      console.log('Creating team with auth state:', { 
        userId: user.id, 
        authenticated: !!user 
      });
      
      // Ensure valid session
      await validateSession();
      
      return await createTeam(user.id, name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('Team created successfully');
    },
    onError: (error) => {
      toast(`Failed to create team: ${error.message}`);
    }
  });
}
