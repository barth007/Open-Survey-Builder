import { debugLog, debugWarn } from '@/lib/logger';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { createTeam, getAuthStateDebugInfo } from '@/services/team/teamCreationService';
import { performDeepSessionValidation } from '@/services/team/teamAuthService';

export function useTeamCreation() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      // Check for authenticated user
      if (!user) throw new Error('You must be logged in to create a team');
      
      debugLog('Team creation auth debug:');
      debugLog('Creating team with auth state:', { 
        userId: user.id, 
        authenticated: !!user,
        email: user.email
      });
      
      // Show detailed auth state
      debugLog('Current auth state:', await getAuthStateDebugInfo());
      
      try {
        // Always refresh session before team creation
        await refreshSession();
        
        // Extra verification step with deep validation
        try {
          await performDeepSessionValidation();
        } catch (validationError) {
          console.error('Session validation failed:', validationError);
          throw validationError;
        }
        
        debugLog('Session is valid, proceeding with team creation');
        const team = await createTeam(user.id, name, description);
        
        // Immediately invalidate teams query to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        
        return team;
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
      toast.success('Team created successfully!');
    },
    onError: (error: Error) => {
      console.error('Error in team creation mutation:', error);
      toast.error(error.message || 'Failed to create team');
    }
  });
}
