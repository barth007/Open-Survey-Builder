
import React, { useState } from 'react';
import { Users, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTeams, Team } from '@/hooks/useTeams';
import { TeamCreationDialog } from './team/TeamCreationDialog';
import { InvitationDialog } from './team/InvitationDialog';
import { TeamDetails } from './team/TeamDetails';
import { EmptyTeamState } from './team/EmptyTeamState';
import { RemoveMemberDialog, DeleteTeamDialog } from './team/ConfirmationDialogs';
import { ChangeRoleDialog } from './team/ChangeRoleDialog';

const TeamTab = () => {
  const { user } = useAuth();
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
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

  const { 
    teams, 
    teamMembers, 
    invitations, 
    isLoading, 
    error,
    removeTeamMember,
    updateTeamMemberRole,
    updateTeam,
    deleteTeam
  } = useTeams();

  // Initialize activeTeamTab with the first team's ID when teams are loaded
  React.useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamTab) {
      setActiveTeamTab(teams[0].id);
    }
  }, [teams, activeTeamTab]);

  const openInviteDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsInviteDialogOpen(true);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    try {
      removeTeamMember({ 
        teamId: memberToRemove.teamId, 
        userId: memberToRemove.userId 
      });
      setMemberToRemove(null);
    } catch (error: any) {
      console.error(`Failed to remove member:`, error);
    }
  };

  const handleUpdateMemberRole = (newRole: 'admin' | 'member') => {
    if (!memberRoleToChange) return;
    
    updateTeamMemberRole({
      teamId: memberRoleToChange.teamId,
      userId: memberRoleToChange.userId,
      newRole
    });
  };

  const handleUpdateTeam = (teamId: string, updates: { name: string; description: string }) => {
    updateTeam({ teamId, updates });
  };

  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    
    try {
      deleteTeam(teamToDelete);
      setTeamToDelete(null);
      setActiveTeamTab(null);
    } catch (error: any) {
      console.error(`Failed to delete team:`, error);
    }
  };

  const userRole = (team: Team) => {
    if (!teamMembers) return null;
    const members = teamMembers[team.id] || [];
    const currentMember = members.find(member => member.user_id === user?.id);
    return currentMember?.role || null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team management section */}
      {teams && teams.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Teams
              </CardTitle>
              <CardDescription>Manage your teams and team members</CardDescription>
            </div>
            <Button onClick={() => setIsCreateTeamDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTeamTab || undefined} onValueChange={setActiveTeamTab}>
              <TabsList className="mb-4">
                {teams.map(team => (
                  <TabsTrigger key={team.id} value={team.id} className="relative">
                    {team.name}
                    {userRole(team) === 'owner' && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Owner
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {teams.map(team => (
                <TabsContent key={team.id} value={team.id} className="space-y-4">
                  <TeamDetails 
                    team={team}
                    teamMembers={teamMembers?.[team.id]}
                    invitations={invitations?.[team.id]}
                    userRole={userRole(team)}
                    currentUserId={user?.id}
                    onOpenInvite={openInviteDialog}
                    onDeleteTeam={setTeamToDelete}
                    onRemoveMember={(teamId, userId, name) => 
                      setMemberToRemove({ teamId, userId, name })}
                    onUpdateTeam={handleUpdateTeam}
                    onUpdateMemberRole={(teamId, userId, name, currentRole, newRole) => {
                      setMemberRoleToChange({ teamId, userId, name, currentRole });
                      updateTeamMemberRole({ teamId, userId, newRole });
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <EmptyTeamState onCreateTeam={() => setIsCreateTeamDialogOpen(true)} />
      )}

      {/* Dialogs */}
      <TeamCreationDialog 
        isOpen={isCreateTeamDialogOpen} 
        onOpenChange={setIsCreateTeamDialogOpen} 
      />
      
      <InvitationDialog 
        isOpen={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen}
        teamId={selectedTeamId}
      />
      
      <RemoveMemberDialog
        isOpen={!!memberToRemove}
        onOpenChange={(isOpen) => !isOpen && setMemberToRemove(null)}
        memberName={memberToRemove?.name || 'this user'}
        onConfirm={handleRemoveMember}
      />
      
      <DeleteTeamDialog
        isOpen={!!teamToDelete}
        onOpenChange={(isOpen) => !isOpen && setTeamToDelete(null)}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
};

export default TeamTab;
