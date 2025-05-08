
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'checking' | 'unknown';

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

  // Centralized function to check user approval status
  const checkApprovalStatus = async (): Promise<ApprovalStatus> => {
    if (!user) return 'unknown';
    
    try {
      setApprovalStatus('checking');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking profile status:', error);
        setApprovalStatus('unknown');
        return 'unknown';
      }
      
      console.log('Profile status:', data?.status);
      
      if (!data) {
        setApprovalStatus('unknown');
        return 'unknown';
      }
      
      // Set and return the status
      const status = data.status as ApprovalStatus;
      setApprovalStatus(status);
      return status;
    } catch (err) {
      console.error('Error in checkApprovalStatus:', err);
      setApprovalStatus('unknown');
      return 'unknown';
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
          checkApprovalStatus(); // Check approval status on sign-in
        } else if (event === 'SIGNED_OUT') {
          toast("You have been signed out");
          setApprovalStatus('unknown'); // Reset approval status on sign-out
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
          
          // Check approval status if we have a user
          if (initialSession?.user) {
            checkApprovalStatus();
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
