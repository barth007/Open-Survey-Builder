import { debugLog, debugWarn } from '@/lib/logger';

import { supabase } from '@/integrations/supabase/client';

/**
 * Performs a deep session validation to verify the authentication state
 * This is useful for operations that require confirmed authentication
 * @returns The validated user ID
 */
export async function performDeepSessionValidation() {
  try {
    // Check the current session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session validation error:', sessionError);
      throw new Error('Authentication error: Your session could not be validated.');
    }
    
    if (!sessionData.session) {
      console.error('No active session found during validation');
      
      // Try to refresh the session automatically
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh error:', refreshError || 'No session after refresh');
        throw new Error('Authentication error: Please sign in again to continue.');
      }
      
      debugLog('Session refreshed automatically during validation');
    }
    
    // Verify session with server-side validation
    try {
      const { data, error } = await supabase.rpc('validate_auth_session');
      
      if (error) {
        console.error('Deep auth validation failed:', error);
        throw new Error('Authentication error: Your session could not be verified.');
      }
      
      debugLog('Auth validation successful:', data);
      return data; // This should be the user ID
    } catch (e) {
      console.error('RPC execution error:', e);
      throw new Error('Authentication error: Please sign in again to continue.');
    }
  } catch (error) {
    console.error('Session validation failed:', error);
    throw error;
  }
}
