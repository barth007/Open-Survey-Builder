import { supabase } from '@/lib/supabase-client'; // Ensure supabase is initialized
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/types/database'; // Import the Database type

const upsertUserProfile = async (userId: string, avatarUrl?: string, fullName?: string, bio?: string, website?: string) => {
  const { data, error } = await supabase
    .from<Database['public']['Tables']['profiles']['Insert']>('profiles') // Specify the correct table type
    .upsert([
      {
        id: userId, // Use the user ID from auth
        avatar_url: avatarUrl || null, // Profile photo URL
        full_name: fullName || null, // Full name
        bio: bio || null, // Bio
        website: website || null, // Website
      },
    ]);

  if (error) {
    console.error('Error inserting/updating profile:', error);
    throw new Error(error.message);
  }

  return data;
};

// Modify the signInWithGoogle function to handle profile upsert
const signInWithGoogle = async () => {
  try {
    const redirectTo = 'https://your-redirect-url.com/';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
      toast('Authentication Failed', {
        description: error.message,
      });
      throw error;
    }

    if (data && data.url) {
      console.log('Redirect URL:', data.url);
    }

    // After sign-in, retrieve user data and upsert the profile
    const user = supabase.auth.user();
    if (user) {
      const { user_metadata } = user;
      await upsertUserProfile(
        user.id, 
        user_metadata?.avatar_url, 
        user_metadata?.full_name,
        user_metadata?.bio,
        user_metadata?.website
      );
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    toast('Authentication Error', {
      description: 'Failed to sign in with Google. Please try again.',
    });
    throw error;
  }
};
