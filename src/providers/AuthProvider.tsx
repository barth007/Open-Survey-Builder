
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'checking' | 'unknown';

interface StatusCache {
  status: ApprovalStatus;
  timestamp: number;
  attemptCount: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  approvalStatus: ApprovalStatus;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkApprovalStatus: () => Promise<ApprovalStatus>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  approvalStatus: 'unknown',
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshSession: async () => false,
  checkApprovalStatus: async () => 'unknown',
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // Max retries for failed status checks
  const MAX_STATUS_CHECK_RETRIES = 3;
  
  // Minimum time between status checks (5 seconds)
  const MIN_STATUS_CHECK_INTERVAL = 5000;

  // Debug function for session state
  const logSessionState = (prefix: string, currentSession: Session | null) => {
    console.log(
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

  // Centralized function to check user approval status with throttling and circuit breaking
  const checkApprovalStatus = async (): Promise<ApprovalStatus> => {
    // If no user, return unknown immediately
    if (!user) return 'unknown';
    
    // Check if a request is already in progress
    if (checkingStatusRef.current) {
      console.log('Status check already in progress, using cached value:', statusCacheRef.current.status);
      return statusCacheRef.current.status;
    }
    
    // Calculate time since last check
    const now = Date.now();
    const timeSinceLastCheck = now - statusCacheRef.current.timestamp;
    
    // If we checked recently and have a valid status, return cached value
    if (timeSinceLastCheck < MIN_STATUS_CHECK_INTERVAL && statusCacheRef.current.status !== 'unknown') {
      console.log('Using cached status check:', statusCacheRef.current.status, 
        'Age:', Math.round(timeSinceLastCheck/1000), 'seconds');
      return statusCacheRef.current.status;
    }
    
    // Check if we've hit max retries for failed requests
    if (statusCacheRef.current.attemptCount >= MAX_STATUS_CHECK_RETRIES && 
        statusCacheRef.current.status === 'unknown') {
      console.log('Max retries reached for status check, circuit broken');
      // Reset attempt count after a cooling period (30 seconds)
      if (timeSinceLastCheck > 30000) {
        statusCacheRef.current.attemptCount = 0;
      } else {
        return 'unknown';
      }
    }
    
    try {
      // Mark that we're checking
      checkingStatusRef.current = true;
      setApprovalStatus('checking');
      
      console.log('Checking profile status for user:', user.id, 
        'Attempt:', statusCacheRef.current.attemptCount + 1);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking profile status:', error);
        // Update cache with error attempt
        statusCacheRef.current.attemptCount += 1;
        statusCacheRef.current.timestamp = now;
        setApprovalStatus('unknown');
        return 'unknown';
      }
      
      console.log('Profile status result:', data?.status);
      
      if (!data) {
        // Reset cache on success but no data
        statusCacheRef.current = {
          status: 'unknown',
          timestamp: now,
          attemptCount: 0
        };
        setApprovalStatus('unknown');
        return 'unknown';
      }
      
      // Success - reset attempt counter and update cache
      const status = data.status as ApprovalStatus;
      statusCacheRef.current = {
        status,
        timestamp: now,
        attemptCount: 0
      };
      setApprovalStatus(status);
      return status;
    } catch (err) {
      console.error('Error in checkApprovalStatus:', err);
      // Update cache with error attempt
      statusCacheRef.current.attemptCount += 1;
      statusCacheRef.current.timestamp = now;
      setApprovalStatus('unknown');
      return 'unknown';
    } finally {
      // Release the lock
      checkingStatusRef.current = false;
    }
  };

  // Force a complete session refresh to resolve RLS issues
  const forceRefreshSession = async (): Promise<boolean> => {
    try {
      console.log('Forcing full session refresh...');
      
      // Get the current user's email
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.user?.email) {
        console.log('No user email found for session refresh');
        return false;
      }
      
      // Sign out first
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear all supabase-related data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          console.log('Clearing localStorage key:', key);
          localStorage.removeItem(key);
        }
      }
      
      // Wait a moment for browser to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // We would need a way to sign in again automatically here
      // This would typically require a password or token that we don't have
      // So we'll need to redirect to login
      
      console.log('Force refresh complete - user needs to sign in again');
      return false;
    } catch (error) {
      console.error('Error during forced session refresh:', error);
      return false;
    }
  };

  // Session recovery function
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('Manually refreshing session...');
      
      // First try refreshing the token
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data.session) {
        logSessionState('Session refreshed', data.session);
        setSession(data.session);
        setUser(data.session.user);
        return true;
      } else {
        console.log('No session found during refresh');
        return false;
      }
    } catch (error) {
      console.error('Exception during session refresh:', error);
      return false;
    }
  };

  // Handle user session
  useEffect(() => {
    console.log('Setting up auth state listener');
    let mounted = true;
    
    // Set up auth listener first to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
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
          // Check approval status only once on sign-in
          setTimeout(() => {
            checkApprovalStatus();
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          toast("You have been signed out");
          setApprovalStatus('unknown');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed automatically');
        }
        
        setIsLoading(false);
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
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
          
          // Don't check approval status immediately on initial load
          // Components will handle it when needed with throttling
          if (initialSession?.user) {
            // Just set a timeout to avoid conflicts with component mounts
            setTimeout(() => {
              checkApprovalStatus();
            }, 1500);
          }
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

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
        toast(error.message);
        throw error;
      }

      console.log('OAuth sign-in initiated:', data);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast("Failed to sign in with Google. Please try again.");
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear supabase-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          console.log('Clearing localStorage key before signout:', key);
          localStorage.removeItem(key);
        }
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
        toast("Failed to sign out. Please try again.");
        throw error;
      }
      
      // Force clear session state
      setUser(null);
      setSession(null);
      setApprovalStatus('unknown');
      
      console.log('Sign out completed successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        approvalStatus,
        signInWithGoogle,
        signOut,
        refreshSession,
        checkApprovalStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
