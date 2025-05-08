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

/**
 * Accepts an invitation and adds the user to the team
 * @param invitationId The invitation ID to accept
 * @param userId The user ID to add to the team
 * @returns The team ID the user was added to
 */
export async function acceptInvitation(invitationId: string, userId: string) {
  // Start transaction
  const { data: invitation, error: fetchError } = await supabase
    .from('team_invitations')
    .select('invitation_code, team_id')
    .eq('id', invitationId)
    .eq('status', 'pending')
    .single();

  if (fetchError) {
    console.error('Error fetching invitation:', fetchError);
    throw fetchError;
  }

  if (!invitation) {
    throw new Error('Invitation not found or already processed');
  }

  // Process the invitation using the existing function
  try {
    const teamId = await processInvitation(invitation.invitation_code, userId);
    
    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);
    
    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      throw updateError;
    }
    
    return teamId;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Rejects an invitation
 * @param invitationId The invitation ID to reject
 * @returns The updated invitation
 */
export async function rejectInvitation(invitationId: string) {
  try {
    const { data, error } = await supabase
      .from('team_invitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in rejectInvitation:', error);
    throw error;
  }
}
