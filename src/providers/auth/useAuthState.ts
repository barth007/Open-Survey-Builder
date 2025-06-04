import { debugLog, debugWarn } from '@/lib/logger';

import { useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ApprovalStatus, StatusCache } from './types';
import { toast } from '@/components/ui/sonner';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('unknown');
  
  // Cache for status checks with throttling
  const statusCacheRef = useRef<StatusCache>({
    status: 'unknown',
    timestamp: 0,
    attemptCount: 0
  });
  
  // Request in progress tracker
  const checkingStatusRef = useRef<boolean>(false);

  // Debug function for session state
  const logSessionState = (prefix: string, currentSession: Session | null) => {
    debugLog(
      `${prefix} - Session state:`, 
      {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id || 'none',
        expires: currentSession?.expires_at ? new Date(currentSession.expires_at * 1000).toISOString() : 'none',
        storageType: typeof localStorage,
        accessTokenLength: currentSession?.access_token?.length || 0,
        refreshTokenLength: currentSession?.refresh_token?.length || 0,
      }
    );
  };

  // Handle user session
  useEffect(() => {
    debugLog('Setting up auth state listener');
    let mounted = true;
    
    // Set up auth listener first to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        debugLog('Auth state changed:', event, currentSession?.user?.id);
        logSessionState('Auth state change event', currentSession);
        
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          toast("Successfully signed in");
          // Reset status cache on sign-in
          statusCacheRef.current = {
            status: 'unknown',
            timestamp: 0,
            attemptCount: 0
          };
        } else if (event === 'SIGNED_OUT') {
          toast("You have been signed out");
          setApprovalStatus('unknown');
        } else if (event === 'TOKEN_REFRESHED') {
          debugLog('Token refreshed automatically');
        }
        
        setIsLoading(false);
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        debugLog('Initializing auth state...');
        // Always start with loading state
        setIsLoading(true);
        
        // Get the session from storage
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }
        
        logSessionState('Initial auth session', initialSession);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('Exception during auth initialization:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    checkingStatusRef,
    logSessionState
  };
}
