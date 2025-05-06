
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshSession: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debug function for session state
  const logSessionState = (prefix: string, currentSession: Session | null) => {
    console.log(
      `${prefix} - Session state:`, 
      {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id || 'none',
        expires: currentSession?.expires_at ? new Date(currentSession.expires_at * 1000).toISOString() : 'none',
        storageType: typeof localStorage,
      }
    );
  };

  // Session recovery function
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('Manually refreshing session...');
      const { data, error } = await supabase.auth.getSession();
      
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
        } else if (event === 'SIGNED_OUT') {
          toast("You have been signed out");
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast("Failed to sign out. Please try again.");
        throw error;
      }
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
        signInWithGoogle,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
