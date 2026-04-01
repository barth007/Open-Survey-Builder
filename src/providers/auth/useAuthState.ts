import { debugLog } from '@/lib/logger';
import { useState, useEffect, useRef } from 'react';
import { ApprovalStatus, StatusCache, User, Session } from './types';
import { refreshSession } from './authService';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('unknown');

  const statusCacheRef = useRef<StatusCache>({
    status: 'unknown',
    timestamp: 0,
    attemptCount: 0
  });

  const checkingStatusRef = useRef<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        debugLog('Initializing local auth state...');
        setIsLoading(true);

        const token = localStorage.getItem('sb_auth_token');
        if (!token) {
          setUser(null);
          setSession(null);
          setApprovalStatus('unknown');
          return;
        }

        const refreshed = await refreshSession();
        if (!refreshed) {
          setUser(null);
          setSession(null);
          setApprovalStatus('unknown');
          return;
        }

        const userJson = localStorage.getItem('sb_user');
        if (!userJson) {
          setUser(null);
          setSession(null);
          setApprovalStatus('unknown');
          return;
        }

        try {
          const userData = JSON.parse(userJson) as User;
          setUser(userData);
          setSession({ token, user: userData });
          setApprovalStatus(userData.status as ApprovalStatus);
        } catch (e) {
          console.error('Error parsing stored user data', e);
          localStorage.removeItem('sb_auth_token');
          localStorage.removeItem('sb_user');
          setUser(null);
          setSession(null);
          setApprovalStatus('unknown');
        }
      } catch (error) {
        console.error('Exception during auth initialization:', error);
        localStorage.removeItem('sb_auth_token');
        localStorage.removeItem('sb_user');
        setUser(null);
        setSession(null);
        setApprovalStatus('unknown');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  useEffect(() => {
    const id = setInterval(async () => {
      if (!localStorage.getItem('sb_auth_token')) return;
      const ok = await refreshSession();
      if (!ok) {
        setUser(null);
        setSession(null);
        setApprovalStatus('unknown');
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    approvalStatus,
    setApprovalStatus,
    statusCacheRef,
    checkingStatusRef
  };
}
