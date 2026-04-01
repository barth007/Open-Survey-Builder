import { debugLog, debugWarn } from '@/lib/logger';

import React from 'react';
import { TeamCreationDialog } from './TeamCreationDialog';
import { InvitationDialog } from './InvitationDialog';
import { RemoveMemberDialog, DeleteTeamDialog } from './ConfirmationDialogs';
import { useTeamContext } from '@/contexts/TeamContext';

interface TeamMember {
  user_id: string;
  email?: string | null;
  name?: string | null;
  role: string;
}

interface TeamDialogsProps {
  isCreateTeamDialogOpen: boolean;
  setIsCreateTeamDialogOpen: (isOpen: boolean) => void;
  isInviteDialogOpen: boolean;
  setIsInviteDialogOpen: (isOpen: boolean) => void;
  selectedTeamId: string | null;
  onRemoveMember: () => void;
  onDeleteTeam: () => void;
  teamMembers?: Record<string, TeamMember[]>;
}

export const TeamDialogs = ({
  isCreateTeamDialogOpen,
  setIsCreateTeamDialogOpen,
  isInviteDialogOpen,
  setIsInviteDialogOpen,
  selectedTeamId,
  onRemoveMember,
  onDeleteTeam,
  teamMembers,
}: TeamDialogsProps) => {
  const { memberToRemove, setMemberToRemove, teamToDelete, setTeamToDelete } = useTeamContext();

  const existingMembers = selectedTeamId ? (teamMembers?.[selectedTeamId] ?? []) : [];

  return (
    <>
      <TeamCreationDialog
        isOpen={isCreateTeamDialogOpen}
        onOpenChange={(isOpen) => {
          debugLog('Team creation dialog state changed to:', isOpen);
          setIsCreateTeamDialogOpen(isOpen);
        }}
      />

      <InvitationDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={(isOpen) => {
          debugLog('Invitation dialog state changed to:', isOpen);
          setIsInviteDialogOpen(isOpen);
        }}
        teamId={selectedTeamId}
        existingMembers={existingMembers}
      />

      <RemoveMemberDialog
        isOpen={!!memberToRemove}
        onOpenChange={(isOpen) => {
          debugLog('Remove member dialog state changed to:', isOpen);
          if (!isOpen) setMemberToRemove(null);
        }}
        memberName={memberToRemove?.name || 'this user'}
        onConfirm={onRemoveMember}
      />

      <DeleteTeamDialog
        isOpen={!!teamToDelete}
        onOpenChange={(isOpen) => {
          debugLog('Delete team dialog state changed to:', isOpen);
          if (!isOpen) setTeamToDelete(null);
        }}
        onConfirm={onDeleteTeam}
      />
    </>
  );
};
