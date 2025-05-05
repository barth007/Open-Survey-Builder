
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  updated_at: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        
        // Check if the avatars bucket exists, and if not, attempt to create it
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
          
        if (!bucketsError && buckets) {
          const avatarBucketExists = buckets.some(bucket => bucket.name === 'avatars');
          
          if (!avatarBucketExists) {
            try {
              // Try to create the bucket silently
              await supabase.storage.createBucket('avatars', { public: true });
              console.log('Created avatars bucket');
            } catch (bucketError) {
              // Bucket might already exist or user doesn't have permission
              console.log('Note: Could not create avatars bucket', bucketError);
            }
          }
        }
        
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
            console.log('Profile fetched successfully:', data);
            setProfile(data as Profile);
            setError(null);
          } else {
            console.log('No profile found, creating a new one');
            // Create a new profile if one doesn't exist
            await createProfile();
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        if (isMounted) {
          setError(error as Error);
          toast("Couldn't load your profile information. Please try again later.");
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
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          email: user.email,
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast("Couldn't create your profile. Please try again later.");
          throw insertError;
        }

        setProfile(newProfile);
        console.log('New profile created successfully:', newProfile);
      } catch (error) {
        console.error('Error creating profile:', error);
        setError(error as Error);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

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
