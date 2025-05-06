
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
  
  const { data, error } = await supabase
    .from('teams')
    .insert([{ 
      name, 
      description, 
      owner_id: userId 
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating team:', error);
    console.error('Error details:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message
    });
    throw error;
  }
  
  console.log('Team created successfully:', data);
  return data;
}
