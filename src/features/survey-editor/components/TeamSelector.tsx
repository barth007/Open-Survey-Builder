import { debugLog } from '@/lib/logger';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useTeamSurveys } from '@/hooks/useTeamSurveys';
import { Loader2, Users, CheckCircle2, ChevronDown } from 'lucide-react';
import { fetchTeams } from '@/services/teamService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TeamSelectorProps {
  surveyId: string;
  currentTeamId: string | null | undefined;
  currentFolderId?: string | null;
  disabled?: boolean;
}

type Team = {
  id: string;
  name: string;
  avatar_url?: string | null;
};

export function TeamSelector({
  surveyId,
  currentTeamId,
  currentFolderId,
  disabled = false
}: TeamSelectorProps) {
  const { updateSurveyTeam } = useTeamSurveys();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teams the user is a member of with our backend API
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['user_teams', user?.id],
    queryFn: async () => {
      if (!user) return [];

      debugLog('Fetching teams for user:', user.id);

      try {
        const teamsData = await fetchTeams(user.id);

        debugLog('Teams data loaded from API:', teamsData);
        return teamsData as Team[];
      } catch (error) {
        console.error('Error fetching teams from API:', error);
        throw error;
      }
    },
    enabled: !!user
  });

  const handleTeamSelect = async (teamId: string | null) => {
    if (teamId === currentTeamId) return;

    setIsLoading(true);
    try {
      const nextFolderId = currentFolderId ? null : undefined;

      debugLog('Updating survey team:', { surveyId, teamId, folderId: nextFolderId });
      await updateSurveyTeam({ surveyId, teamId, folderId: nextFolderId });
    } catch (error) {
      console.error('Error updating survey team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Find current team name
  const currentTeam = teams?.find(team => team.id === currentTeamId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || teamsLoading}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !currentTeamId && "text-muted-foreground"
          )}
          disabled={disabled || teamsLoading || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentTeamId ? (
            <>
              <Avatar className="h-5 w-5 mr-2">
                <AvatarFallback className="text-xs">{currentTeam?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate">{currentTeam?.name || 'Unknown Team'}</span>
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              <span>Not shared with a team</span>
            </>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] bg-white">
        <DropdownMenuItem
          className="flex items-center"
          onSelect={() => handleTeamSelect(null)}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Private (Just me)</span>
          {currentTeamId === null && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {teams && teams.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {teams.map(team => (
              <DropdownMenuItem
                key={team.id}
                className="flex items-center"
                onSelect={() => handleTeamSelect(team.id)}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarFallback className="text-xs">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="truncate">{team.name}</span>
                {currentTeamId === team.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
