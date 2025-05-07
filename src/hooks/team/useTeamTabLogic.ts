
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
    isLoading, 
    error,
    removeTeamMember,
    updateTeamMemberRole,
    updateTeam,
    deleteTeam
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
    console.log('TeamTab mounted with user:', user);
  }, [user]);
  
  useEffect(() => {
    console.log('TeamTab data updated:', { 
      teams, 
      teamMembers, 
      invitations, 
      isLoading, 
      error,
      activeTeamTab
    });

    // Debug team membership data
    if (teams && teamMembers && user) {
      teams.forEach(team => {
        const members = teamMembers[team.id] || [];
        console.log(`Team ${team.id} (${team.name}) members:`, members);
        
        // Check if current user is in the members list
        const isUserMember = members.some(member => member.user_id === user.id);
        console.log(`User ${user.id} is member of team ${team.id}: ${isUserMember}`);
        
        // Check if current user is team owner
        const isUserOwner = team.owner_id === user.id;
        console.log(`User ${user.id} is owner of team ${team.id}: ${isUserOwner}`);
      });
    }
  }, [teams, teamMembers, invitations, isLoading, error, activeTeamTab, user]);

  // Initialize activeTeamTab with the first team's ID when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamTab) {
      console.log('Setting active team tab to first team:', teams[0].id);
      setActiveTeamTab(teams[0].id);
    }
  }, [teams, activeTeamTab, setActiveTeamTab]);

  const openInviteDialog = (teamId: string) => {
    console.log('Opening invite dialog for team:', teamId);
    setSelectedTeamId(teamId);
    setIsInviteDialogOpen(true);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    try {
      console.log('Removing member:', memberToRemove);
      removeTeamMember({ 
        teamId: memberToRemove.teamId, 
        userId: memberToRemove.userId 
      });
    } catch (error: any) {
      console.error(`Failed to remove member:`, error);
    }
  };

  const handleUpdateMemberRole = (teamId: string, userId: string, name: string | null, currentRole: string, newRole: 'admin' | 'member') => {
    console.log('Updating member role:', { teamId, userId, name, currentRole, newRole });
    updateTeamMemberRole({
      teamId,
      userId,
      newRole
    });
  };

  const handleUpdateTeam = (teamId: string, updates: { name: string; description: string }) => {
    console.log('Updating team:', { teamId, updates });
    updateTeam({ teamId, updates });
  };

  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    
    try {
      console.log('Deleting team:', teamToDelete);
      deleteTeam(teamToDelete);
      setActiveTeamTab(null);
    } catch (error: any) {
      console.error(`Failed to delete team:`, error);
    }
  };

  const userRole = (team: Team) => {
    if (!teamMembers || !user) {
      console.log(`No teamMembers data available for team ${team.id}`);
      return null;
    }
    
    const members = teamMembers[team.id] || [];
    console.log(`Getting userRole for team ${team.id}. Members:`, members);
    console.log(`Current user ID: ${user?.id}`);
    
    // Check if user is the team owner first
    if (team.owner_id === user.id) {
      console.log(`User is the owner of team ${team.id}`);
      return 'owner';
    }
    
    // Otherwise check team_members for role
    const currentMember = members.find(member => member.user_id === user.id);
    console.log(`Current member found:`, currentMember);
    
    return currentMember?.role || null;
  };

  return {
    user,
    teams,
    teamMembers,
    invitations,
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
    userRole
  };
}
