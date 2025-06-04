import { debugLog, debugWarn } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  updated_at: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileCreated, setProfileCreated] = useState(false);

  // Fetch profile on component mount or when user changes
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;
    
    async function fetchProfile() {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        debugLog('Fetching profile for user:', user.id);
        
        // Use maybeSingle instead of single to handle case where profile doesn't exist
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          throw fetchError;
        }

        if (isMounted) {
          if (data) {
            debugLog('Profile fetched successfully:', data);
            
            // Log the exact status value received from the database
            debugLog('Profile status from database:', data.status);
            
            setProfile(data as Profile);
            setError(null);
            setProfileCreated(true);
          } else {
            debugLog('No profile found, creating a new one');
            // Create a new profile if one doesn't exist
            await createProfile();
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        if (isMounted) {
          setError(error as Error);
          
          // Retry logic for profile fetch
          if (retryCount < maxRetries) {
            retryCount++;
            debugLog(`Retrying profile fetch (${retryCount}/${maxRetries}) after ${retryDelay}ms`);
            
            setTimeout(() => {
              if (isMounted && !profileCreated) {
                fetchProfile();
              }
            }, retryDelay * retryCount);
          } else {
            // Let's try to create a profile if we couldn't find one
            if ((error as any).code === 'PGRST116') {
              debugLog('Trying to create a profile after fetch error');
              try {
                await createProfile();
              } catch (createError) {
                console.error('Error creating profile after fetch error:', createError);
                toast("Couldn't load or create your profile information. Please try again later.");
              }
            } else {
              toast("Couldn't load your profile information. Please try again later.");
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Helper function to create a new profile
    async function createProfile() {
      if (!user) return;
      
      try {
        // Create profile with standardized fields
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          email: user.email,
          status: 'pending', // Use standardized status
          role: 'user', // Default role
          updated_at: new Date().toISOString()
        };
        
        debugLog('Creating new profile:', newProfile);
        
        const { error: insertError, data } = await supabase
          .from('profiles')
          .upsert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          if (insertError.message?.includes('violates row-level security policy')) {
            // This is likely happening because our insert is not matching the RLS policy
            console.error('RLS violation during profile creation. Current user:', user.id);
            
            // Try refreshing the session before retrying
            await supabase.auth.refreshSession();
            
            // Try again after refresh
            const { error: retryError, data: retryData } = await supabase
              .from('profiles')
              .upsert([newProfile])
              .select()
              .single();
              
            if (retryError) {
              console.error('Profile creation retry failed:', retryError);
              throw retryError;
            } else if (retryData) {
              setProfile(retryData as Profile);
              setProfileCreated(true);
            }
          } else {
            throw insertError;
          }
        } else if (data) {
          setProfile(data as Profile);
          setProfileCreated(true);
        }

        debugLog('New profile created successfully:', data || newProfile);
      } catch (error) {
        console.error('Error creating profile:', error);
        setError(error as Error);
        throw error;
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user, profileCreated]);

  // Function to update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    
    try {
      // Update timestamp
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      debugLog('Updating profile with data:', updatedData);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast("There was a problem updating your profile");
        throw updateError;
      }

      // Update local state with new values
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      toast("Your profile has been updated successfully");
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("There was a problem updating your profile");
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
}
