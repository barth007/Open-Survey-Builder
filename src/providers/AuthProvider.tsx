
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Add debug information about current URL
  useEffect(() => {
    console.log('Current location in AuthProvider:', window.location.href);
  }, []);

  // Initialize the auth state when the provider is mounted
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      console.log('Current URL during auth change:', window.location.href);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking session at URL:', window.location.href);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        console.log('Initial auth state:', initialSession?.user ? 'Logged in' : 'Not logged in');
        if (initialSession?.user) {
          console.log('User authenticated:', initialSession.user.email);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast("Authentication Error", {
          description: "Failed to check your session status. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google sign-in function
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in flow...');
      
      // Get the hostname from the current URL
      const hostname = window.location.hostname;
      
      // Check if we're in the preview panel (ends with .lovableproject.com)
      if (!hostname.endsWith('.lovableproject.com')) {
        console.error('Not in preview panel - authentication must be performed in the preview panel');
        toast("Authentication Error", {
          description: "Please use the preview panel for authentication"
        });
        return;
      }
      
      // Construct the preview panel URL
      const previewOrigin = `https://${hostname}`;
      const redirectUrl = `${previewOrigin}/login`;
      
      console.log('Using preview panel URL:', previewOrigin);
      console.log('Redirect URL for auth:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast("Authentication Failed", {
          description: error.message
        });
        return;
      }

      if (data && data.url) {
        console.log('OAuth redirect URL generated:', data.url);
        toast("Redirecting", {
          description: "Taking you to Google for authentication"
        });
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Exception during Google sign-in:', error);
      toast("Authentication Error", {
        description: error?.message || "Failed to sign in with Google. Please try again."
      });
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast("Sign Out Error", {
          description: error.message
        });
        return;
      }
      
      setUser(null);
      setSession(null);
      navigate('/login');
      toast("Signed Out", {
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      console.error('Exception during sign out:', error);
      toast("Sign Out Error", {
        description: error?.message || "An error occurred while signing out"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
