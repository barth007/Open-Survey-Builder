
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

/**
 * Fetches all teams for a specific user
 * @param userId The user ID to fetch teams for
 * @returns Promise resolving to an array of teams
 */
export async function fetchTeams(userId: string): Promise<Team[]> {
  console.log('Fetching teams for user:', userId);
  
  try {
    // First fetch teams where user is the owner
    const { data: ownedTeams, error: ownedError } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', userId);
    
    if (ownedError) {
      console.error('Error fetching owned teams:', ownedError);
      throw ownedError;
    }
    
    console.log('Owned teams fetched:', ownedTeams);
    
    // Then fetch team IDs where user is a member (avoiding the problematic join)
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);
    
    if (memberError) {
      console.error('Error fetching team memberships:', memberError);
      throw memberError;
    }
    
    console.log('Team memberships fetched:', memberships);
    
    // Extract team IDs from memberships
    const teamIds = memberships.map(m => m.team_id);
    console.log('Team IDs from memberships:', teamIds);
    
    // If user is a member of any teams, fetch those teams
    let memberTeams: any[] = [];
    if (teamIds.length > 0) {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);
      
      if (teamsError) {
        console.error('Error fetching member teams:', teamsError);
        throw teamsError;
      }
      
      memberTeams = teams || [];
      console.log('Member teams fetched:', memberTeams);
    }
    
    // Combine and deduplicate the results
    const allTeams = [...(ownedTeams || []), ...memberTeams];
    const uniqueTeams = allTeams.filter((team, index, self) =>
      index === self.findIndex(t => t.id === team.id)
    );
    
    console.log('Final combined teams (after deduplication):', uniqueTeams);
    return uniqueTeams as Team[];
  } catch (error) {
    console.error('Error in fetchTeams:', error);
    throw error;
  }
}

/**
 * Fetches all team members for a specific team
 * @param teamId The team ID to fetch members for
 * @returns Promise resolving to an array of team members
 */
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  console.log(`Starting fetchTeamMembers for team ${teamId}`);
  
  try {
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
    
    console.log(`Team ${teamId} members data:`, data);
    
    // Verify the data structure returned
    if (data && data.length > 0) {
      console.log('Sample member data structure:', {
        id: data[0].id,
        user_id: data[0].user_id,
        role: data[0].role,
        profile: data[0].profiles
      });
    }
    
    return data as TeamMember[];
  } catch (error) {
    console.error(`Error in fetchTeamMembers for team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Fetches all pending invitations for a specific team
 * @param teamId The team ID to fetch invitations for
 * @returns Promise resolving to an array of team invitations
 */
export async function fetchTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  console.log(`Starting fetchTeamInvitations for team ${teamId}`);
  
  try {
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
    
    console.log(`Team ${teamId} invitations data:`, data);
    return data as TeamInvitation[];
  } catch (error) {
    console.error(`Error in fetchTeamInvitations for team ${teamId}:`, error);
    throw error;
  }
}
