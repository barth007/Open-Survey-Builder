import { supabase } from '@/integrations/supabase/client';

/**
 * Validates that the user has a valid session
 * Throws an error if no valid session exists
 * @returns The validated session object
 */
export async function validateSession() {
  console.log('Validating session...');
  
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session validation error:', sessionError);
      throw new Error('Authentication failed: Unable to validate your session');
    }
    
    if (!sessionData.session || !sessionData.session.access_token) {
      console.error('No valid session found during validation');
      throw new Error('Authentication required: Please sign in again');
    }
    
    // Check if user exists in session
    if (!sessionData.session.user?.id) {
      console.error('No user ID found in session during validation');
      throw new Error('Authentication problem: User ID not found');
    }
    
    // Check token expiry
    const tokenExpiryTime = sessionData.session.expires_at 
      ? new Date(sessionData.session.expires_at * 1000) 
      : null;
      
    if (tokenExpiryTime && tokenExpiryTime <= new Date()) {
      console.error('Session token expired during validation:', tokenExpiryTime);
      throw new Error('Your session has expired: Please sign in again');
    }
    
    // Log session details for debugging
    console.log('Session validation successful', {
      userId: sessionData.session.user.id,
      expiresAt: tokenExpiryTime?.toISOString(),
      isTokenValid: tokenExpiryTime ? tokenExpiryTime > new Date() : false
    });
    
    return sessionData.session;
  } catch (error) {
    console.error('Session validation failed with exception:', error);
    throw error;
  }
}

/**
 * Enhanced session validation that performs additional checks
 * and attempts to verify authentication status with the server
 */
export async function performDeepSessionValidation() {
  console.log('Performing deep session validation...');
  
  try {
    // First validate the basic session
    const session = await validateSession();
    
    // Next, verify the session is actually working by making a test request
    const { data: testData, error: testError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (testError) {
      if (testError.message?.includes('JWT') || testError.message?.includes('token') || 
          testError.message?.includes('auth') || testError.message?.includes('permission')) {
        console.error('JWT validation failed on server:', testError);
        throw new Error('Server rejected authentication token: Please sign out and sign in again');
      }
      // Other errors might not be auth related
      console.error('Database test request failed (might not be auth related):', testError);
    } else {
      console.log('Deep validation successful - database request succeeded');
    }
    
    return session;
  } catch (error) {
    console.error('Deep session validation failed:', error);
    throw error;
  }
}
