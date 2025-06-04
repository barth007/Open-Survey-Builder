import { debugLog, debugWarn } from '@/lib/logger';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { fetchUserInvitations } from '@/services/teamService';

export function useUserInvitations() {
  const { user } = useAuth();
  
  const { 
    data: receivedInvitations, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user_invitations', user?.email],
    queryFn: async () => {
      if (!user || !user.email) {
        debugLog('No user email available to fetch invitations');
        return [];
      }
      try {
        debugLog('Fetching invitations for user:', user.email);
        const invitations = await fetchUserInvitations(user.email);
        return invitations;
      } catch (error) {
        console.error('Error fetching user invitations:', error);
        throw error;
      }
    },
    enabled: !!user?.email
  });

  return {
    receivedInvitations,
    isLoading,
    error,
    refetch
  };
}
