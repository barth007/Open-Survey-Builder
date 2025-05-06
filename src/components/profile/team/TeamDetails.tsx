
import React from 'react';
import { UserPlus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMembersList } from './TeamMembersList';
import { PendingInvitations } from './PendingInvitations';
import { TeamMember, TeamInvitation, Team } from '@/types/team-types';

interface TeamDetailsProps {
  team: Team;
  teamMembers: TeamMember[] | undefined;
  invitations: TeamInvitation[] | undefined;
  userRole: string | null;
  currentUserId: string | undefined;
  onOpenInvite: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onRemoveMember: (teamId: string, userId: string, name: string | null) => void;
}

export const TeamDetails = ({
  team,
  teamMembers,
  invitations,
  userRole,
  currentUserId,
  onOpenInvite,
  onDeleteTeam,
  onRemoveMember
}: TeamDetailsProps) => {
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
      />

      {/* Pending invitations */}
      {(userRole === 'owner' || userRole === 'admin') && (
        <PendingInvitations invitations={invitations || []} />
      )}
    </div>
  );
};
