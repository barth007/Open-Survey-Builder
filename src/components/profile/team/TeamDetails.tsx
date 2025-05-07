
import React, { useState, useEffect } from 'react';
import { TeamMembersList } from './TeamMembersList';
import { PendingInvitations } from './PendingInvitations';
import { TeamMember, TeamInvitation, Team } from '@/types/team-types';
import { EditTeamDialog } from './EditTeamDialog';
import { TeamHeader } from './TeamHeader';

interface TeamDetailsProps {
  team: Team;
  teamMembers: TeamMember[] | undefined;
  invitations: TeamInvitation[] | undefined;
  userRole: string | null;
  currentUserId: string | undefined;
  onOpenInvite: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onRemoveMember: (teamId: string, userId: string, name: string | null) => void;
  onUpdateTeam: (teamId: string, updates: { name: string; description: string }) => void;
  onUpdateMemberRole: (teamId: string, userId: string, memberName: string | null, currentRole: string, newRole: 'admin' | 'member') => void;
}

export const TeamDetails = ({
  team,
  teamMembers,
  invitations,
  userRole,
  currentUserId,
  onOpenInvite,
  onDeleteTeam,
  onRemoveMember,
  onUpdateTeam,
  onUpdateMemberRole
}: TeamDetailsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    console.log('TeamDetails rendered with:', {
      team,
      teamId: team?.id,
      teamName: team?.name,
      teamMembersCount: teamMembers?.length,
      invitationsCount: invitations?.length,
      userRole,
      currentUserId,
      teamMembers,
      invitations
    });
  }, [team, teamMembers, invitations, userRole, currentUserId]);

  if (!currentUserId) {
    console.log('TeamDetails: No currentUserId, returning null');
    return null;
  }
  
  console.log('TeamDetails: Rendering UI with userRole:', userRole);
  console.log('TeamDetails: Can show owner controls?', userRole === 'owner');
  console.log('TeamDetails: Can show admin controls?', userRole === 'owner' || userRole === 'admin');
  
  return (
    <div className="space-y-4">
      <TeamHeader 
        team={team}
        userRole={userRole}
        onEditTeam={() => setIsEditDialogOpen(true)}
        onInvite={onOpenInvite}
        onDeleteTeam={onDeleteTeam}
      />
      
      {/* Team members */}
      <TeamMembersList 
        teamMembers={teamMembers || []} 
        currentUserId={currentUserId}
        userRole={userRole}
        onRemoveMember={(userId, name) => {
          console.log('TeamDetails: Remove member initiated', { userId, name });
          onRemoveMember(team.id, userId, name);
        }}
        onChangeRole={(userId, name, currentRole) => {
          console.log('TeamDetails: Change role initiated', { userId, name, currentRole });
          onUpdateMemberRole(team.id, userId, name, currentRole, currentRole === 'admin' ? 'member' : 'admin');
        }}
      />

      {/* Pending invitations */}
      {(userRole === 'owner' || userRole === 'admin') && (
        <PendingInvitations invitations={invitations || []} />
      )}
      
      {/* Edit Team Dialog */}
      <EditTeamDialog
        team={team}
        isOpen={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          console.log('TeamDetails: EditTeamDialog state changed to', isOpen);
          setIsEditDialogOpen(isOpen);
        }}
        onSave={(teamId, updates) => {
          console.log('TeamDetails: Team update requested', { teamId, updates });
          onUpdateTeam(teamId, updates);
        }}
      />
    </div>
  );
};
