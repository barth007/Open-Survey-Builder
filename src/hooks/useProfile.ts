
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export type Profile = {
  id: string;  // Uses id to match the database schema
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  updated_at: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch profile on component mount or when user changes
  useEffect(() => {
    let isMounted = true;
    
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
        console.log('Fetching profile for user:', user.id);
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)  // Using id to match the database schema
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          throw fetchError;
        }

        if (isMounted) {
          console.log('Profile fetched successfully:', data);
          setProfile(data as Profile);
          setError(null);
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        if (isMounted) {
          setError(error as Error);
          toast({
            title: "Profile Error",
            description: "Couldn't load your profile information",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  // Function to update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    
    try {
      // Update timestamp
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Updating profile with data:', updatedData);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id);  // Using id to match the database schema

      if (updateError) {
        throw updateError;
      }

      // Update local state with new values
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive"
      });
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
