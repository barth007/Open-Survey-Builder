
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
        const refreshSuccess = await refreshSession();
        console.log('Session refresh result:', refreshSuccess);
        
        if (!refreshSuccess) {
          // Manual token refresh through the API if our helper didn't work
          const { data, error } = await supabase.auth.refreshSession();
          if (error || !data.session) {
            console.error('Manual token refresh failed:', error);
            throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
          }
        }
        
        // Extra verification step with deep validation
        try {
          await performDeepSessionValidation();
        } catch (validationError) {
          console.error('Session validation failed:', validationError);
          toast.error('Authentication error: Please sign out and sign in again to refresh your session.');
          throw validationError;
        }
        
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
      toast.success('Team created successfully!');
    },
    onError: (error: Error) => {
      console.error('Error in team creation mutation:', error);
      toast.error(error.message || 'Failed to create team');
    }
  });
}

// Add missing import
import { supabase } from '@/integrations/supabase/client';
