
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates that the user has a valid session
 * Throws an error if no valid session exists
 */
export async function validateSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session validation error:', sessionError);
    throw new Error('Authentication failed: Unable to validate your session');
  }
  
  if (!sessionData.session || !sessionData.session.access_token) {
    console.error('No valid session found');
    throw new Error('Authentication required: Please sign in again');
  }
  
  if (!sessionData.session.user?.id) {
    console.error('No user ID found in session');
    throw new Error('Authentication problem: User ID not found');
  }
  
  const tokenExpiryTime = sessionData.session.expires_at 
    ? new Date(sessionData.session.expires_at * 1000) 
    : null;
    
  if (tokenExpiryTime && tokenExpiryTime <= new Date()) {
    console.error('Session token expired:', tokenExpiryTime);
    throw new Error('Your session has expired: Please sign in again');
  }
  
  return sessionData.session;
}
