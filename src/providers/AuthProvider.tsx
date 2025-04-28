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

const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || !hostname.endsWith('.lovableproject.com');
};

const mockSession = {
  user: {
    id: 'dev-user-id',
    email: 'dev@example.com',
    user_metadata: {
      full_name: 'Development User',
      avatar_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=dev'
    }
  } as User,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token'
} as Session;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize the auth state when the provider is mounted
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth in environment:', isDevelopment() ? 'development' : 'production');
        
        if (isDevelopment()) {
          console.log('Using mock session for development');
          setSession(mockSession);
          setUser(mockSession.user);
          setIsLoading(false);
          return;
        }

        // Set up auth state listener for production
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setIsLoading(false);
        });

        // Check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        return () => subscription.unsubscribe();
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
  }, []);

  // Google sign-in function
  const signInWithGoogle = async () => {
    if (isDevelopment()) {
      console.log('Development environment detected, using mock session');
      setSession(mockSession);
      setUser(mockSession.user);
      navigate('/');
      toast("Development Mode", {
        description: "Using mock authentication for development"
      });
      return;
    }

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
    if (isDevelopment()) {
      console.log('Development environment detected, clearing mock session');
      setSession(null);
      setUser(null);
      navigate('/login');
      toast("Signed Out", {
        description: "Development session cleared"
      });
      return;
    }

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
