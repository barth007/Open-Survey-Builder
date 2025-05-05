import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface ActiveUser {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  last_active: Date;
}

export const useActiveUsers = (surveyId: string | undefined) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!surveyId || !user) return;

    // Setup a channel for real-time presence
    const channel = supabase.channel(`survey:${surveyId}`);
    
    // Function to update user presence
    const updatePresence = async () => {
      await channel.track({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        online_at: new Date().toISOString(),
      });
    };

    // Subscribe to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const usersArray: ActiveUser[] = Object.values(newState).map((users: any) => {
          // Each key has an array of presences
          const userInfo = users[0]; // Taking first presence
          return {
            id: userInfo.user_id,
            name: userInfo.name,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
            last_active: new Date(userInfo.online_at),
          };
        });
        setActiveUsers(usersArray);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Initial presence update
          await updatePresence();
          
          // Setup interval to periodically update presence while the user is active
          const presenceInterval = setInterval(updatePresence, 30000); // Every 30 seconds
          
          return () => {
            clearInterval(presenceInterval);
            channel.unsubscribe();
          };
        }
      });

    // Update presence on window focus
    const handleFocus = () => {
      updatePresence();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      channel.unsubscribe();
    };
  }, [surveyId, user]);

  return { activeUsers };
};
