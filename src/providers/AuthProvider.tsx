
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handle user session and profile creation/update
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If the user just signed in, ensure they have a profile
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            try {
              const { data: existingProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user!.id)  // Changed from user_id to id
                .maybeSingle();
                
              if (profileError && !profileError.message.includes('No rows found')) {
                console.error('Error fetching profile:', profileError);
              }

              if (!existingProfile) {
                // If the profile doesn't exist, create it
                console.log('Creating new profile for user:', currentSession.user.id);
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: currentSession.user!.id,  // Changed from user_id to id
                    avatar_url: currentSession.user?.user_metadata?.avatar_url || null,
                    full_name: currentSession.user?.user_metadata?.full_name || null,
                    updated_at: new Date().toISOString()
                  });

                if (insertError) {
                  console.error('Error creating profile:', insertError);
                  toast('Profile Creation Error', {
                    description: 'There was an issue setting up your profile.',
                  });
                } else {
                  console.log('Profile created successfully');
                }
              } else {
                console.log('Profile already exists for user:', currentSession.user.id);
              }
            } catch (error) {
              console.error('Error checking/creating user profile:', error);
            }
          }, 0);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial auth session:', initialSession?.user?.id);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/profile',
        },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
        toast('Authentication Failed', {
          description: error.message,
        });
        throw error;
      }

      console.log('OAuth sign-in initiated:', data);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast('Authentication Error', {
        description: 'Failed to sign in with Google. Please try again.',
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
