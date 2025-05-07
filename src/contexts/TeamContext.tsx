
import React, { createContext, useContext, useState } from 'react';
import { Team, TeamMember, TeamInvitation } from '@/types/team-types';

type TeamContextType = {
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  activeTeamTab: string | null;
  setActiveTeamTab: (id: string | null) => void;
  memberToRemove: { teamId: string; userId: string; name: string | null } | null;
  setMemberToRemove: (member: { teamId: string; userId: string; name: string | null } | null) => void;
  teamToDelete: string | null;
  setTeamToDelete: (id: string | null) => void;
  memberRoleToChange: {
    teamId: string;
    userId: string;
    name: string | null;
    currentRole: string;
  } | null;
  setMemberRoleToChange: (member: {
    teamId: string;
    userId: string;
    name: string | null;
    currentRole: string;
  } | null) => void;
};

export const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ teamId: string; userId: string; name: string | null } | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [memberRoleToChange, setMemberRoleToChange] = useState<{
    teamId: string;
    userId: string;
    name: string | null;
    currentRole: string;
  } | null>(null);

  return (
    <TeamContext.Provider
      value={{
        selectedTeamId,
        setSelectedTeamId,
        activeTeamTab,
        setActiveTeamTab,
        memberToRemove,
        setMemberToRemove,
        teamToDelete,
        setTeamToDelete,
        memberRoleToChange,
        setMemberRoleToChange,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeamContext = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};
