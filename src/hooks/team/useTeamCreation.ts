
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { createTeam, getAuthStateDebugInfo } from '@/services/teamService';
import { performDeepSessionValidation } from '@/services/teamService';

export function useTeamCreation() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      // Enhanced authentication validation
      if (!user) throw new Error('You must be logged in to create a team');
      
      // Extended auth debugging
      console.log('Team creation auth debug:');
      console.log('Creating team with auth state:', { 
        userId: user.id, 
        authenticated: !!user,
        email: user.email
      });
      
      // Show detailed auth state
      console.log('Current auth state:', await getAuthStateDebugInfo());
      
      try {
        // Always attempt a session refresh before team creation
        console.log('Preemptively refreshing session before team creation...');
        await refreshSession();
        
        // Extra verification step with deep validation
        try {
          await performDeepSessionValidation();
        } catch (validationError) {
          console.error('Deep validation failed after refresh:', validationError);
          throw validationError;
        }
        
        console.log('Session is valid, proceeding with team creation');
        return await createTeam(user.id, name, description);
      } catch (error: any) {
        console.error('Team creation error:', error);
        
        // Enhanced error handling
        if (error.message?.includes('row-level security policy') || 
            error.message?.includes('Authorization error') ||
            error.message?.includes('Authentication error') ||
            error.message?.includes('JWT')) {
          // User-friendly error for auth issues
          const refreshError = new Error('Authentication error: Please sign out and sign in again to refresh your session.');
          console.error('Auth related error detected:', refreshError.message);
          throw refreshError;
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
