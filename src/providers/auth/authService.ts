
import { supabase } from '@/integrations/supabase/client';
import { ApprovalStatus, StatusCache } from './types';
import { toast } from '@/components/ui/sonner';

// Max retries for failed status checks
const MAX_STATUS_CHECK_RETRIES = 3;
  
// Minimum time between status checks (5 seconds)
const MIN_STATUS_CHECK_INTERVAL = 5000;

export async function checkApprovalStatus(
  userId: string | undefined,
  statusCacheRef: React.MutableRefObject<StatusCache>,
  checkingStatusRef: React.MutableRefObject<boolean>,
  setApprovalStatus: (status: ApprovalStatus) => void
): Promise<ApprovalStatus> {
  // If no user, return unknown immediately
  if (!userId) return 'unknown';
  
  // Check if a request is already in progress
  if (checkingStatusRef.current) {
    console.log('Status check already in progress, using cached value:', statusCacheRef.current.status);
    return statusCacheRef.current.status;
  }
  
  // Calculate time since last check
  const now = Date.now();
  const timeSinceLastCheck = now - statusCacheRef.current.timestamp;
  
  // If we checked recently and have a valid status, return cached value
  if (timeSinceLastCheck < MIN_STATUS_CHECK_INTERVAL && statusCacheRef.current.status !== 'unknown') {
    console.log('Using cached status check:', statusCacheRef.current.status, 
      'Age:', Math.round(timeSinceLastCheck/1000), 'seconds');
    return statusCacheRef.current.status;
  }
  
  // Check if we've hit max retries for failed requests
  if (statusCacheRef.current.attemptCount >= MAX_STATUS_CHECK_RETRIES && 
      statusCacheRef.current.status === 'unknown') {
    console.log('Max retries reached for status check, circuit broken');
    // Reset attempt count after a cooling period (30 seconds)
    if (timeSinceLastCheck > 30000) {
      statusCacheRef.current.attemptCount = 0;
    } else {
      return 'unknown';
    }
  }
  
  try {
    // Mark that we're checking
    checkingStatusRef.current = true;
    setApprovalStatus('checking');
    
    console.log('Checking profile status for user:', userId, 
      'Attempt:', statusCacheRef.current.attemptCount + 1);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking profile status:', error);
      // Update cache with error attempt
      statusCacheRef.current.attemptCount += 1;
      statusCacheRef.current.timestamp = now;
      setApprovalStatus('unknown');
      return 'unknown';
    }
    
    console.log('Profile status result:', data?.status);
    
    if (!data) {
      console.log('No profile found, creating one...');
      
      try {
        // Create a profile for this user
        const userResponse = await supabase.auth.getUser();
        if (userResponse.error) {
          console.error('Error getting user for profile creation:', userResponse.error);
          throw userResponse.error;
        }
        
        const user = userResponse.data.user;
        
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            email: user.email,
            status: 'pending',
            role: 'user',
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating profile during status check:', insertError);
          statusCacheRef.current = {
            status: 'unknown',
            timestamp: now,
            attemptCount: statusCacheRef.current.attemptCount + 1
          };
          setApprovalStatus('unknown');
          return 'unknown';
        }
        
        console.log('Created new profile during status check:', newProfile);
        statusCacheRef.current = {
          status: 'pending',
          timestamp: now,
          attemptCount: 0
        };
        setApprovalStatus('pending');
        return 'pending';
      } catch (err) {
        console.error('Error in profile creation during status check:', err);
        statusCacheRef.current.attemptCount += 1;
        statusCacheRef.current.timestamp = now;
        setApprovalStatus('unknown');
        return 'unknown';
      }
    }
    
    // Success - reset attempt counter and update cache
    const status = data.status as ApprovalStatus;
    statusCacheRef.current = {
      status,
      timestamp: now,
      attemptCount: 0
    };
    setApprovalStatus(status);
    return status;
  } catch (err) {
    console.error('Error in checkApprovalStatus:', err);
    // Update cache with error attempt
    statusCacheRef.current.attemptCount += 1;
    statusCacheRef.current.timestamp = now;
    setApprovalStatus('unknown');
    return 'unknown';
  } finally {
    // Release the lock
    checkingStatusRef.current = false;
  }
}

export async function refreshSession() {
  try {
    console.log('Manually refreshing session...');
    
    // First try refreshing the token
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
    
    if (data.session) {
      console.log('Session refreshed', {
        hasSession: !!data.session,
        userId: data.session?.user?.id || 'none',
      });
      return true;
    } else {
      console.log('No session found during refresh');
      return false;
    }
  } catch (error) {
    console.error('Exception during session refresh:', error);
    return false;
  }
}

export async function signInWithGoogle() {
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
}

export async function signOut() {
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
    
    console.log('Sign out completed successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
