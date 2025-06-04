import { debugLog, debugWarn } from '@/lib/logger';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PenLine, UserPlus, Trash } from 'lucide-react';
import { Team } from '@/types/team-types';

interface TeamHeaderProps {
  team: Team;
  userRole: string | null;
  onEditTeam: () => void;
  onInvite: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
}

export const TeamHeader = ({
  team,
  userRole,
  onEditTeam,
  onInvite,
  onDeleteTeam
}: TeamHeaderProps) => {
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-medium">{team.name}</h3>
        {team.description && (
          <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
        )}
      </div>
      <div className="space-x-2">
        {isOwner && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              debugLog('TeamHeader: Edit button clicked for team', team.id);
              onEditTeam();
            }}
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        
        {(isOwner || isAdmin) && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
              debugLog('TeamHeader: Invite button clicked for team', team.id);
              onInvite(team.id);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
        
        {isOwner && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              debugLog('TeamHeader: Delete team button clicked for team', team.id);
              onDeleteTeam(team.id);
            }}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Team
          </Button>
        )}
      </div>
    </div>
  );
};
