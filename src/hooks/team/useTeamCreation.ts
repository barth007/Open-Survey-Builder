
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
      // Check for authenticated user
      if (!user) throw new Error('You must be logged in to create a team');
      
      console.log('Team creation auth debug:');
      console.log('Creating team with auth state:', { 
        userId: user.id, 
        authenticated: !!user,
        email: user.email
      });
      
      // Show detailed auth state
      console.log('Current auth state:', await getAuthStateDebugInfo());
      
      try {
        // Always refresh session before team creation
        await refreshSession();
        
        // Extra verification step with deep validation
        await performDeepSessionValidation();
        
        console.log('Session is valid, proceeding with team creation');
        return await createTeam(user.id, name, description);
      } catch (error: any) {
        console.error('Team creation error:', error);
        
        if (error.message?.includes('row-level security policy') || 
            error.message?.includes('Authorization error') ||
            error.message?.includes('Authentication error') ||
            error.message?.includes('JWT')) {
          // User-friendly error for auth issues
          throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: Error) => {
      console.error('Error in team creation mutation:', error);
    }
  });
}
