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
    // Fetch team members directly without trying to join with profiles
    const { data: membersData, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);
    
    if (membersError) {
      console.error(`Error fetching members for team ${teamId}:`, membersError);
      throw membersError;
    }

    // Convert to array if not already
    const members = Array.isArray(membersData) ? membersData : [];
    console.log(`Team ${teamId} members basic data:`, members);
    
    // Now fetch profiles separately and join them in memory
    const userIds = members.map(member => member.user_id);
    
    // If no members, return empty array
    if (userIds.length === 0) {
      console.log(`No members found for team ${teamId}, returning empty array`);
      return members as TeamMember[];
    }
    
    // Fetch profiles for all member user IDs
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error(`Error fetching profiles for team ${teamId}:`, profilesError);
      // Don't throw here, we can still return members without profiles
      console.log(`Returning members without profile data`);
      return members as TeamMember[];
    }
    
    // Create a map of profiles by user ID for quick lookup
    const profilesMap: Record<string, any> = {};
    (profilesData || []).forEach(profile => {
      profilesMap[profile.id] = profile;
    });

    console.log(`Profiles data fetched:`, profilesData);
    
    // Join the profiles with members
    const membersWithProfiles = members.map(member => ({
      ...member,
      profile: profilesMap[member.user_id] || null
    }));
    
    console.log(`Team ${teamId} members with profiles:`, membersWithProfiles);
    return membersWithProfiles as TeamMember[];
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

/**
 * Fetches all pending invitations for the current user's email
 * @param userEmail The email address to fetch invitations for
 * @returns Promise resolving to an array of team invitations
 */
export async function fetchUserInvitations(userEmail: string): Promise<TeamInvitation[]> {
  console.log(`Fetching invitations for user email: ${userEmail}`);
  
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
        status,
        teams (
          id,
          name,
          description,
          owner_id
        )
      `)
      .eq('email', userEmail)
      .eq('status', 'pending')
      .filter('expires_at', 'gt', new Date().toISOString());
    
    if (error) {
      console.error(`Error fetching invitations for email ${userEmail}:`, error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} invitations for ${userEmail}:`, data);
    
    // Transform the data to include team info directly in the invitation
    const invitationsWithTeamInfo = data?.map(inv => ({
      ...inv,
      team: inv.teams,
      teams: undefined // Remove the nested teams object
    })) || [];
    
    return invitationsWithTeamInfo as TeamInvitation[];
  } catch (error) {
    console.error(`Error in fetchUserInvitations for ${userEmail}:`, error);
    throw error;
  }
}
