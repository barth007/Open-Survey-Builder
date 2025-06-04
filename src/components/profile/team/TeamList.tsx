import { debugLog, debugWarn } from '@/lib/logger';

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/types/team-types';
import { useTeamContext } from '@/contexts/TeamContext';

interface TeamListProps {
  teams: Team[];
  userRole: (team: Team) => string | null;
}

export const TeamList = ({ teams, userRole }: TeamListProps) => {
  const { activeTeamTab, setActiveTeamTab } = useTeamContext();

  return (
    <TabsList className="mb-4">
      {teams.map(team => {
        const role = userRole(team);
        debugLog(`Team ${team.id} (${team.name}) - User role: ${role}`);
        
        return (
          <TabsTrigger key={team.id} value={team.id} className="relative">
            {team.name}
            {role === 'owner' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Owner
              </Badge>
            )}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};
