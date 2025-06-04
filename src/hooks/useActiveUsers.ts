import { debugLog, debugWarn } from '@/lib/logger';
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

    const channel = supabase.channel(`survey:${surveyId}`);

    // Function to update user presence
    const updatePresence = async () => {
      const result = await channel.track({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        online_at: new Date().toISOString(),
      });
      debugLog("[DEBUG] track result:", result);
    };

    // Subscribe to presence changes
    let presenceInterval: ReturnType<typeof setInterval>;

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        debugLog("[DEBUG] presenceState raw:", newState);
        const usersArray: ActiveUser[] = Object.values(newState).map((users: any) => {
          const userInfo = users[0]; // Taking first presence
          return {
            id: userInfo.user_id,
            name: userInfo.name,
            email: userInfo.email,
            avatar_url: userInfo.avatar_url,
            last_active: new Date(userInfo.online_at),
          };
        });

        // Also show yourself
        const self: ActiveUser = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
          last_active: new Date(),
        };

        const uniqueUsers = [...usersArray.filter(u => u.id !== self.id), self];
        debugLog("[DEBUG] activeUsers parsed:", uniqueUsers);
        setActiveUsers(uniqueUsers);
      })
      .subscribe(async (status) => {
        debugLog("[DEBUG] channel status:", status);
        if (status === 'SUBSCRIBED') {
          await updatePresence(); // ✅ now it’s safe to push
          presenceInterval = setInterval(updatePresence, 30000);
        }
      });

    // Update presence on focus
    const handleFocus = () => {
      updatePresence();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(presenceInterval);
      channel.unsubscribe();
    };
  }, [surveyId, user]);

  return { activeUsers };
};
