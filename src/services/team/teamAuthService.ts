
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates the current user session
 * @returns The valid session if available
 * @throws Error if no valid session exists
 */
export async function validateSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session || !sessionData.session.access_token) {
    throw new Error('Valid authentication session required');
  }
  
  const tokenExpiry = sessionData.session.expires_at
    ? new Date(sessionData.session.expires_at * 1000)
    : null;
  console.log('Token expires at:', tokenExpiry?.toISOString());
  
  return sessionData.session;
}
