
import { supabase } from '@/integrations/supabase/client';
import { performDeepSessionValidation } from './teamAuthService';

/**
 * Creates a new team with the specified owner
 * @param userId The owner's user ID
 * @param name The team name
 * @param description Optional team description
 * @returns The newly created team data
 */
export async function createTeam(userId: string, name: string, description?: string) {
  console.log('=== TEAM CREATION START ===');
  console.log('Creating team with owner_id:', userId);
  console.log(`Will insert: { name: "${name}", description: ${description ? `"${description}"` : 'null'}, owner_id: "${userId}" }`);
  
  try {
    // Perform authentication check with the server
    console.log('Performing deep authentication validation before team creation...');
    try {
      await performDeepSessionValidation();
    } catch (authError) {
      console.error('Deep auth validation failed:', authError);
      throw authError;
    }
    
    // Create the team - the trigger will automatically add the owner as a member
    console.log('Executing team insert...');
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([{ 
        name, 
        description, 
        owner_id: userId 
      }])
      .select()
      .single();
    
    if (teamError) {
      console.error('Error creating team:', teamError);
      
      // Specific error handling for RLS policy violations
      if (teamError.message?.includes('violates row-level security policy')) {
        console.error('RLS policy violation details:', {
          errorCode: teamError.code,
          hint: teamError.hint,
          details: teamError.details
        });
        
        // Try to refresh the session directly here as a last resort
        const { data: refreshResult } = await supabase.auth.refreshSession();
        if (!refreshResult.session) {
          throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
        }
        
        // Retry the operation with the fresh token
        const { data: retryData, error: retryError } = await supabase
          .from('teams')
          .insert([{ 
            name, 
            description, 
            owner_id: userId 
          }])
          .select()
          .single();
          
        if (retryError) {
          console.error('Error on retry:', retryError);
          throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
        }
        
        console.log('Team created successfully on retry:', retryData);
        return retryData;
      }
      
      throw teamError;
    }
    
    console.log('Team created successfully:', teamData);
    console.log('=== TEAM CREATION COMPLETE ===');
    return teamData;
  } catch (error) {
    console.error('=== TEAM CREATION FAILED ===', error);
    throw error;
  }
}

/**
 * Helper function to get detailed auth state for debugging
 */
export async function getAuthStateDebugInfo() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { error: error.message };
    }
    
    return {
      hasSession: !!data.session,
      userId: data.session?.user?.id || null,
      expiresAt: data.session?.expires_at 
        ? new Date(data.session.expires_at * 1000).toISOString()
        : null,
      isExpired: data.session?.expires_at 
        ? new Date(data.session.expires_at * 1000) <= new Date()
        : null,
      authHeader: !!data.session?.access_token,
      jwtLength: data.session?.access_token?.length || 0
    };
  } catch (e) {
    return { error: 'Failed to get auth state: ' + (e as Error).message };
  }
}
