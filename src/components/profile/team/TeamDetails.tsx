
import React, { useState } from 'react';
import { UserPlus, Trash, PenLine, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMembersList } from './TeamMembersList';
import { PendingInvitations } from './PendingInvitations';
import { TeamMember, TeamInvitation, Team } from '@/types/team-types';
import { EditTeamDialog } from './EditTeamDialog';

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
  
  if (!currentUserId) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
          )}
        </div>
        <div className="space-x-2">
          {userRole === 'owner' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {(userRole === 'owner' || userRole === 'admin') && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onOpenInvite(team.id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
          
          {userRole === 'owner' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDeleteTeam(team.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Team
            </Button>
          )}
        </div>
      </div>
      
      {/* Team members */}
      <TeamMembersList 
        teamMembers={teamMembers || []} 
        currentUserId={currentUserId}
        userRole={userRole}
        onRemoveMember={(userId, name) => onRemoveMember(team.id, userId, name)}
        onChangeRole={(userId, name, currentRole) => 
          onUpdateMemberRole(team.id, userId, name, currentRole, currentRole === 'admin' ? 'member' : 'admin')}
      />

      {/* Pending invitations */}
      {(userRole === 'owner' || userRole === 'admin') && (
        <PendingInvitations invitations={invitations || []} />
      )}
      
      {/* Edit Team Dialog */}
      <EditTeamDialog
        team={team}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={(teamId, updates) => onUpdateTeam(teamId, updates)}
      />
    </div>
  );
};
