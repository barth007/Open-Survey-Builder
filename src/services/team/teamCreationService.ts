
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a new team with the specified owner
 * @param userId The owner's user ID
 * @param name The team name
 * @param description Optional team description
 * @returns The newly created team data
 */
export async function createTeam(userId: string, name: string, description?: string) {
  console.log('Executing team insert with owner_id:', userId);
  console.log(`Will insert: { name: "${name}", description: ${description ? `"${description}"` : 'null'}, owner_id: "${userId}" }`);
  
  try {
    // First create the team
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
      throw teamError;
    }
    
    console.log('Team created successfully:', teamData);
    
    // Then explicitly create the team member record for the owner
    // This is a safeguard in case the database trigger fails
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamData.id,
        user_id: userId,
        role: 'owner'
      }]);
    
    if (memberError) {
      console.error('Error adding owner as team member:', memberError);
      // Don't throw here, as the team was created successfully
    }
    
    return teamData;
  } catch (error) {
    console.error('Error in createTeam:', error);
    throw error;
  }
}
