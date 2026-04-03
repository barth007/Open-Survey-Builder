
import { debugLog, debugWarn } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ActiveUser } from '@/types/survey-organization';

export const useActiveUsers = (surveyId: string | undefined) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!surveyId || !user) {
      setActiveUsers([]);
      return;
    }

    const self: ActiveUser = {
      id: user.id,
      name: user.user_metadata?.full_name || user.name || user.email || 'Unknown User',
      avatarUrl: user.user_metadata?.avatar_url || user.avatarUrl || undefined,
      lastActive: new Date(),
    };

    debugWarn('Realtime active user presence is disabled because Supabase has been removed');
    setActiveUsers([self]);
  }, [surveyId, user]);

  return { activeUsers };
};
