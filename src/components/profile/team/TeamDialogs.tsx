
import React from 'react';
import { TeamCreationDialog } from './TeamCreationDialog';
import { InvitationDialog } from './InvitationDialog';
import { RemoveMemberDialog, DeleteTeamDialog } from './ConfirmationDialogs';
import { useTeamContext } from '@/contexts/TeamContext';

interface TeamDialogsProps {
  isCreateTeamDialogOpen: boolean;
  setIsCreateTeamDialogOpen: (isOpen: boolean) => void;
  isInviteDialogOpen: boolean;
  setIsInviteDialogOpen: (isOpen: boolean) => void;
  selectedTeamId: string | null;
  onRemoveMember: () => void;
  onDeleteTeam: () => void;
}

export const TeamDialogs = ({
  isCreateTeamDialogOpen,
  setIsCreateTeamDialogOpen,
  isInviteDialogOpen,
  setIsInviteDialogOpen,
  selectedTeamId,
  onRemoveMember,
  onDeleteTeam
}: TeamDialogsProps) => {
  const { memberToRemove, setMemberToRemove, teamToDelete, setTeamToDelete } = useTeamContext();

  return (
    <>
      <TeamCreationDialog 
        isOpen={isCreateTeamDialogOpen} 
        onOpenChange={(isOpen) => {
          console.log('Team creation dialog state changed to:', isOpen);
          setIsCreateTeamDialogOpen(isOpen);
        }} 
      />
      
      <InvitationDialog 
        isOpen={isInviteDialogOpen} 
        onOpenChange={(isOpen) => {
          console.log('Invitation dialog state changed to:', isOpen);
          setIsInviteDialogOpen(isOpen);
        }}
        teamId={selectedTeamId}
      />
      
      <RemoveMemberDialog
        isOpen={!!memberToRemove}
        onOpenChange={(isOpen) => {
          console.log('Remove member dialog state changed to:', isOpen);
          if (!isOpen) setMemberToRemove(null);
        }}
        memberName={memberToRemove?.name || 'this user'}
        onConfirm={onRemoveMember}
      />
      
      <DeleteTeamDialog
        isOpen={!!teamToDelete}
        onOpenChange={(isOpen) => {
          console.log('Delete team dialog state changed to:', isOpen);
          if (!isOpen) setTeamToDelete(null);
        }}
        onConfirm={onDeleteTeam}
      />
    </>
  );
};
