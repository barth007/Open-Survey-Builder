
import { supabase } from '@/integrations/supabase/client';

/**
 * Removes a member from a team
 * @param teamId The team ID to remove member from
 * @param userId The user ID to remove
 * @returns Object containing the team ID and user ID that was removed
 */
export async function removeTeamMember(teamId: string, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
  
  return { teamId, userId };
}

/**
 * Deletes a team
 * @param teamId The team ID to delete
 * @returns The deleted team ID
 */
export async function deleteTeam(teamId: string) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);
  
  if (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
  
  return teamId;
}
