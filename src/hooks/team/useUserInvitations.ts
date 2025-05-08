
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
        console.log('No user email available to fetch invitations');
        return [];
      }
      try {
        console.log('Fetching invitations for user:', user.email);
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
