import { debugLog, debugWarn } from '@/lib/logger';

import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth/AuthProvider';
import { Tabs } from '@/components/ui/tabs';
import { EmptyTeamState } from './team/EmptyTeamState';
import { TeamProvider, useTeamContext } from '@/contexts/TeamContext';
import { TeamTabLoader } from './team/TeamTabLoader';
import { TeamList } from './team/TeamList';
import { TeamTabContent as TeamContent } from './team/TeamTabContent';
import { TeamDialogs } from './team/TeamDialogs';
import { ReceivedInvitations } from './team/ReceivedInvitations';
import { useTeamTabLogic } from '@/hooks/team/useTeamTabLogic';

// Renamed the component to prevent naming conflict with the imported component
const TeamTabInner = () => {
  const { user } = useAuth();
  const { activeTeamTab, setActiveTeamTab } = useTeamContext();
  const {
    teams,
    teamMembers,
    invitations,
    receivedInvitations,
    isLoading,
    error,
    isCreateTeamDialogOpen,
    setIsCreateTeamDialogOpen,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    selectedTeamId,
    openInviteDialog,
    handleRemoveMember,
    handleUpdateMemberRole,
    handleUpdateTeam,
    handleDeleteTeam,
    handleAcceptInvitation,
    handleRejectInvitation,
    isAccepting,
    isRejecting,
    userRole
  } = useTeamTabLogic();

  // Show loader for loading and error states
  const loader = <TeamTabLoader isLoading={isLoading} error={error} />;
  if (isLoading || error) return loader;

  debugLog('TeamTab rendering with teams:', teams);

  // Show user's received invitations at the top, if they exist
  const hasReceivedInvitations = receivedInvitations && receivedInvitations.length > 0;

  // Show empty state when no teams exist and no invitations
  if ((!teams || teams.length === 0) && !hasReceivedInvitations) {
    return (
      <EmptyTeamState onCreateTeam={() => {
        debugLog('Create team button clicked from empty state');
        setIsCreateTeamDialogOpen(true);
      }} />
    );
  }

  return (
    <>
      {/* Show received invitations if any */}
      {hasReceivedInvitations && (
        <div className="mb-6">
          <ReceivedInvitations
            invitations={receivedInvitations}
            onAccept={handleAcceptInvitation}
            onReject={handleRejectInvitation}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
          />
        </div>
      )}

      {(!teams || teams.length === 0) ? (
        <EmptyTeamState onCreateTeam={() => {
          debugLog('Create team button clicked from empty state');
          setIsCreateTeamDialogOpen(true);
        }} />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Teams
              </CardTitle>
              <CardDescription>Manage your teams and team members</CardDescription>
            </div>
            <Button onClick={() => {
              debugLog('Create team button clicked');
              setIsCreateTeamDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTeamTab || undefined}
              onValueChange={(value) => {
                debugLog('Team tab changed to:', value);
                setActiveTeamTab(value);
              }}
            >
              <TeamList teams={teams} userRole={userRole} />
              <TeamContent
                teams={teams}
                teamMembers={teamMembers}
                invitations={invitations}
                userRole={userRole}
                currentUserId={user?.id}
                onOpenInvite={openInviteDialog}
                onUpdateTeam={handleUpdateTeam}
                onUpdateMemberRole={handleUpdateMemberRole}
              />
            </Tabs>
          </CardContent>
        </Card>
      )}

      <TeamDialogs
        isCreateTeamDialogOpen={isCreateTeamDialogOpen}
        setIsCreateTeamDialogOpen={setIsCreateTeamDialogOpen}
        isInviteDialogOpen={isInviteDialogOpen}
        setIsInviteDialogOpen={setIsInviteDialogOpen}
        selectedTeamId={selectedTeamId}
        onRemoveMember={handleRemoveMember}
        onDeleteTeam={handleDeleteTeam}
        teamMembers={teamMembers}
      />
    </>
  );
};

const TeamTab = () => {
  return (
    <TeamProvider>
      <div className="space-y-6">
        <TeamTabInner />
      </div>
    </TeamProvider>
  );
};

export default TeamTab;
