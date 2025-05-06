
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

/**
 * Fetches all teams for a specific user
 * @param userId The user ID to fetch teams for
 * @returns Promise resolving to an array of teams
 */
export async function fetchTeams(userId: string): Promise<Team[]> {
  console.log('Fetching teams for user:', userId);
  
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      description,
      created_at,
      owner_id,
      team_members!inner(
        id,
        team_id,
        user_id,
        role,
        joined_at
      )
    `)
    .eq('team_members.user_id', userId);
  
  if (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
  
  return data as Team[];
}

/**
 * Fetches all team members for a specific team
 * @param teamId The team ID to fetch members for
 * @returns Promise resolving to an array of team members
 */
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      team_id,
      user_id,
      role,
      joined_at,
      profiles(
        full_name, 
        email, 
        avatar_url
      )
    `)
    .eq('team_id', teamId);
  
  if (error) {
    console.error(`Error fetching members for team ${teamId}:`, error);
    throw error;
  }
  
  return data as TeamMember[];
}

/**
 * Fetches all pending invitations for a specific team
 * @param teamId The team ID to fetch invitations for
 * @returns Promise resolving to an array of team invitations
 */
export async function fetchTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select(`
      id,
      team_id,
      email,
      created_at,
      expires_at,
      invitation_code,
      status
    `)
    .eq('team_id', teamId)
    .eq('status', 'pending');
  
  if (error) {
    console.error(`Error fetching invitations for team ${teamId}:`, error);
    throw error;
  }
  
  return data as TeamInvitation[];
}
