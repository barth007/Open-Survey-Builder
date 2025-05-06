
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
    
    // Special auth debug info
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Auth user check:', {
        hasUser: !!userData?.user,
        userId: userData?.user?.id,
        error: userError?.message
      });
      
      if (userData?.user?.id !== userId) {
        console.warn('Warning: Auth user ID mismatch:', {
          authUserId: userData?.user?.id,
          providedUserId: userId
        });
      }
    } catch (e) {
      console.error('Error getting user info:', e);
    }
    
    // First create the team
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
      // Enhanced error handling with more specific messages
      if (teamError.message?.includes('violates row-level security policy')) {
        console.error('RLS policy violation details:', {
          errorCode: teamError.code,
          hint: teamError.hint,
          details: teamError.details
        });
        throw new Error('Authentication error: Please sign out and sign in again to refresh your session.');
      }
      throw teamError;
    }
    
    console.log('Team created successfully:', teamData);
    
    // Add detailed logging for team member creation
    console.log('Now creating team member record for owner...');
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamData.id,
        user_id: userId,
        role: 'owner'
      }])
      .select();
    
    if (memberError) {
      console.error('Error adding owner as team member:', memberError);
      console.log('Team was created but owner member record failed:', {
        teamId: teamData.id,
        userId: userId,
        error: memberError
      });
      // Don't throw here, as the team was created successfully
    } else {
      console.log('Team member record created successfully:', memberData);
    }
    
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
