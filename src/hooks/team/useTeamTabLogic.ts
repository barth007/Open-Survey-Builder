import { debugLog, debugWarn } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTeams, Team } from '@/hooks/useTeams';
import { useTeamContext } from '@/contexts/TeamContext';

export function useTeamTabLogic() {
  const { user } = useAuth();
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { 
    teams, 
    teamMembers, 
    invitations,
    receivedInvitations,
    isLoading, 
    error,
    removeTeamMember,
    updateTeamMemberRole,
    updateTeam,
    deleteTeam,
    acceptInvitation,
    rejectInvitation,
    isAccepting,
    isRejecting
  } = useTeams();
  
  const { 
    selectedTeamId, 
    setSelectedTeamId, 
    activeTeamTab, 
    setActiveTeamTab,
    memberToRemove,
    teamToDelete
  } = useTeamContext();

  useEffect(() => {
    debugLog('TeamTab mounted with user:', user);
  }, [user]);
  
  useEffect(() => {
    debugLog('TeamTab data updated:', { 
      teams: teams?.length, 
      teamMembers: teamMembers ? Object.keys(teamMembers).length : 0, 
      invitations: invitations ? Object.keys(invitations).length : 0,
      receivedInvitations: receivedInvitations?.length,
      isLoading, 
      error,
      activeTeamTab
    });

    // Debug team membership data
    if (teams && teamMembers && user) {
      teams.forEach(team => {
        const members = teamMembers[team.id] || [];
        debugLog(`Team ${team.id} (${team.name}) members:`, members);
        
        // Check if current user is in the members list
        const isUserMember = members.some(member => member.user_id === user.id);
        debugLog(`User ${user.id} is member of team ${team.id}: ${isUserMember}`);
        
        // Check if current user is team owner
        const isUserOwner = team.owner_id === user.id;
        debugLog(`User ${user.id} is owner of team ${team.id}: ${isUserOwner}`);
        
        // Verify if the owner is in the members list
        const ownerInMembersList = members.some(member => member.user_id === team.owner_id);
        debugLog(`Owner is in members list for team ${team.id}: ${ownerInMembersList}`);
      });
    }
  }, [teams, teamMembers, invitations, receivedInvitations, isLoading, error, activeTeamTab, user]);

  // Initialize activeTeamTab with the first team's ID when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamTab) {
      debugLog('Setting active team tab to first team:', teams[0].id);
      setActiveTeamTab(teams[0].id);
    }
  }, [teams, activeTeamTab, setActiveTeamTab]);

  const openInviteDialog = (teamId: string) => {
    debugLog('Opening invite dialog for team:', teamId);
    setSelectedTeamId(teamId);
    setIsInviteDialogOpen(true);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    try {
      debugLog('Removing member:', memberToRemove);
      removeTeamMember({ 
        teamId: memberToRemove.teamId, 
        userId: memberToRemove.userId 
      });
    } catch (error: any) {
      console.error(`Failed to remove member:`, error);
    }
  };

  const handleUpdateMemberRole = (teamId: string, userId: string, name: string | null, currentRole: string, newRole: 'admin' | 'member') => {
    debugLog('Updating member role:', { teamId, userId, name, currentRole, newRole });
    updateTeamMemberRole({
      teamId,
      userId,
      newRole
    });
  };

  const handleUpdateTeam = (teamId: string, updates: { name: string; description: string }) => {
    debugLog('Updating team:', { teamId, updates });
    updateTeam({ teamId, updates });
  };

  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    
    try {
      debugLog('Deleting team:', teamToDelete);
      deleteTeam(teamToDelete);
      setActiveTeamTab(null);
    } catch (error: any) {
      console.error(`Failed to delete team:`, error);
    }
  };

  const handleAcceptInvitation = (invitationId: string) => {
    debugLog('Accepting invitation:', invitationId);
    acceptInvitation(invitationId);
  };

  const handleRejectInvitation = (invitationId: string) => {
    debugLog('Rejecting invitation:', invitationId);
    rejectInvitation(invitationId);
  };

  const userRole = (team: Team) => {
    if (!user) {
      debugLog(`No current user`);
      return null;
    }
    
    // First check: if user is the team owner, return 'owner'
    if (team.owner_id === user.id) {
      debugLog(`User ${user.id} is the owner of team ${team.id} (${team.name})`);
      return 'owner';
    }
    
    // If no team members data available yet, return null
    if (!teamMembers || !teamMembers[team.id]) {
      debugLog(`No teamMembers data available for team ${team.id}`);
      return null;
    }
    
    const members = teamMembers[team.id] || [];
    
    // Check team_members for role
    const currentMember = members.find(member => member.user_id === user.id);
    debugLog(`Current member found:`, currentMember);
    
    return currentMember?.role || null;
  };

  return {
    user,
    teams,
    teamMembers,
    invitations,
    receivedInvitations,
    isLoading,
    error,
    isCreateTeamDialogOpen,
    setIsCreateTeamDialogOpen,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    selectedTeamId,
    openInviteDialog,
    handleRemoveMember,
    handleUpdateMemberRole,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAcceptInvitation,
    handleRejectInvitation,
    isAccepting,
    isRejecting,
    userRole
  };
}
