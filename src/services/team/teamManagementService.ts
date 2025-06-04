import { debugLog, debugWarn } from '@/lib/logger';

import { supabase } from '@/integrations/supabase/client';
import { performDeepSessionValidation } from './teamAuthService';

/**
 * Removes a member from a team
 * @param teamId The team ID to remove member from
 * @param userId The user ID to remove
 * @returns Object containing the team ID and user ID that was removed
 */
export async function removeTeamMember(teamId: string, userId: string) {
  debugLog(`Removing member ${userId} from team ${teamId}`);
  
  try {
    // Verify authentication before proceeding
    await performDeepSessionValidation();
    
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
  } catch (error) {
    console.error('Failed to remove team member:', error);
    throw error;
  }
}

/**
 * Updates a team member's role
 * @param teamId The team ID
 * @param userId The user ID to update
 * @param newRole The new role to assign ('admin', 'member')
 * @returns The updated team member record
 */
export async function updateTeamMemberRole(teamId: string, userId: string, newRole: 'admin' | 'member') {
  debugLog(`Updating member ${userId} role to ${newRole} in team ${teamId}`);
  
  try {
    // Verify authentication before proceeding
    await performDeepSessionValidation();
    
    // Make sure we don't try to downgrade an owner
    const { data: checkData, error: checkError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking team member role:', checkError);
      throw checkError;
    }
    
    if (checkData.role === 'owner') {
      throw new Error('Cannot change role of team owner');
    }
    
    const { data, error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team member role:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update team member role:', error);
    throw error;
  }
}

/**
 * Updates a team's name and/or description
 * @param teamId The team ID to update
 * @param updates Object containing the name and/or description updates
 * @returns The updated team record
 */
export async function updateTeam(teamId: string, updates: { name?: string; description?: string }) {
  debugLog(`Updating team ${teamId}:`, updates);
  
  try {
    // Verify authentication before proceeding
    await performDeepSessionValidation();
    
    if (!updates.name && !updates.description) {
      throw new Error('No updates provided');
    }
    
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update team:', error);
    throw error;
  }
}

/**
 * Deletes a team
 * @param teamId The team ID to delete
 * @returns The deleted team ID
 */
export async function deleteTeam(teamId: string) {
  debugLog(`Deleting team ${teamId}`);
  
  try {
    // Verify authentication before proceeding
    await performDeepSessionValidation();
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    
    if (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
    
    return teamId;
  } catch (error) {
    console.error('Failed to delete team:', error);
    throw error;
  }
}
