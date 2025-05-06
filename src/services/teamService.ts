
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

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

export async function sendInvitation(teamId: string, email: string) {
  // Calculate expiration date (1 week from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Generate invitation code using Supabase function
  const { data: invitationCode } = await supabase.rpc('generate_invitation_code');
  
  const { data, error } = await supabase
    .from('team_invitations')
    .insert([{
      team_id: teamId,
      email,
      expires_at: expiresAt.toISOString(),
      invitation_code: invitationCode,
      status: 'pending'
    }])
    .select(`
      id,
      team_id,
      email,
      created_at,
      expires_at,
      invitation_code,
      status
    `)
    .single();
  
  if (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
  
  return data;
}

export async function processInvitation(invitationCode: string, userId: string) {
  // Process invitation using Supabase function
  const { data: teamId, error: processError } = await supabase
    .rpc('process_team_invitation', { invitation_code: invitationCode });
  
  if (processError) {
    console.error('Error processing invitation:', processError);
    throw processError;
  }
  
  // Add user as team member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert([{
      team_id: teamId,
      user_id: userId,
      role: 'member'
    }]);
  
  if (memberError) {
    console.error('Error adding user to team:', memberError);
    throw memberError;
  }
  
  return teamId;
}

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
