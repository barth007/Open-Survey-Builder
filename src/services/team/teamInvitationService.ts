
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends an invitation to join a team
 * @param teamId The team ID to send invitation for
 * @param email The email address to send invitation to
 * @returns The newly created invitation data
 */
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

/**
 * Processes an invitation by adding the user to the team
 * @param invitationCode The invitation code to process
 * @param userId The user ID to add to the team
 * @returns The team ID the user was added to
 */
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
