
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { createTeam, validateSession } from '@/services/teamService';

export function useTeamCreation() {
  const { user, refreshSession } = useAuth();
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
      
      try {
        // Ensure valid session and attempt refresh if needed
        try {
          await validateSession();
        } catch (sessionError) {
          console.log('Session validation failed, attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            throw new Error('Authentication session expired. Please sign in again.');
          }
          // Validate again after refresh
          await validateSession();
        }
        
        return await createTeam(user.id, name, description);
      } catch (error: any) {
        console.error('Team creation error:', error);
        // Enhanced error handling
        if (error.message?.includes('row-level security policy') || 
            error.message?.includes('Authorization error')) {
          throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('Team created successfully');
    },
    onError: (error: Error) => {
      console.error('Error in team creation mutation:', error);
      toast(`Failed to create team: ${error.message}`);
    }
  });
}
