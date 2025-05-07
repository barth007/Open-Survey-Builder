
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { TeamDetails } from './TeamDetails';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';
import { useTeamContext } from '@/contexts/TeamContext';

interface TeamTabContentProps {
  teams: Team[];
  teamMembers: Record<string, TeamMember[]> | undefined;
  invitations: Record<string, TeamInvitation[]> | undefined;
  userRole: (team: Team) => string | null;
  currentUserId: string | undefined;
  onOpenInvite: (teamId: string) => void;
  onUpdateTeam: (teamId: string, updates: { name: string; description: string }) => void;
  onUpdateMemberRole: (teamId: string, userId: string, name: string | null, currentRole: string, newRole: 'admin' | 'member') => void;
}

export const TeamTabContent = ({
  teams,
  teamMembers,
  invitations,
  userRole,
  currentUserId,
  onOpenInvite,
  onUpdateTeam,
  onUpdateMemberRole
}: TeamTabContentProps) => {
  const { setTeamToDelete, setMemberToRemove } = useTeamContext();

  return (
    <>
      {teams.map(team => {
        const role = userRole(team);
        const members = teamMembers?.[team.id];
        const teamInvitations = invitations?.[team.id];
        
        // Enhanced debug logging
        console.log(`TeamTabContent: Rendering team ${team.id} (${team.name})`, {
          teamOwnerId: team.owner_id,
          currentUserId,
          isOwner: team.owner_id === currentUserId,
          role,
          members: members ? {
            count: members.length,
            memberUserIds: members.map(m => m.user_id),
            memberRoles: members.map(m => m.role),
          } : 'No members data',
          teamInvitations: teamInvitations ? `${teamInvitations.length} invitations` : 'No invitations'
        });
        
        return (
          <TabsContent key={team.id} value={team.id} className="space-y-4">
            <TeamDetails 
              team={team}
              teamMembers={members}
              invitations={teamInvitations}
              userRole={role}
              currentUserId={currentUserId}
              onOpenInvite={onOpenInvite}
              onDeleteTeam={setTeamToDelete}
              onRemoveMember={(teamId, userId, name) => {
                console.log('TeamTabContent: Remove member requested:', { teamId, userId, name });
                setMemberToRemove({ teamId, userId, name });
              }}
              onUpdateTeam={onUpdateTeam}
              onUpdateMemberRole={onUpdateMemberRole}
            />
          </TabsContent>
        );
      })}
    </>
  );
};
