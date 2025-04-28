
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the auth state when the provider is mounted
  useEffect(() => {
    // Get the initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        console.log('Initial auth state:', session?.user ? 'Logged in' : 'Not logged in');
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

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google sign-in function
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in flow...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
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
        // Let the redirect happen automatically
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
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
