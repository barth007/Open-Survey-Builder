import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log('TeamTab mounted with user:', user);
  }, [user]);

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
  
  useEffect(() => {
    console.log('TeamTab data updated:', { 
      teams, 
      teamMembers, 
      invitations, 
      isLoading, 
      error,
      activeTeamTab
    });
  }, [teams, teamMembers, invitations, isLoading, error, activeTeamTab]);

  // Initialize activeTeamTab with the first team's ID when teams are loaded
  React.useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamTab) {
      console.log('Setting active team tab to first team:', teams[0].id);
      setActiveTeamTab(teams[0].id);
    }
  }, [teams, activeTeamTab]);

  const openInviteDialog = (teamId: string) => {
    console.log('Opening invite dialog for team:', teamId);
    setSelectedTeamId(teamId);
    setIsInviteDialogOpen(true);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    try {
      console.log('Removing member:', memberToRemove);
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
    
    console.log('Updating member role:', { ...memberRoleToChange, newRole });
    updateTeamMemberRole({
      teamId: memberRoleToChange.teamId,
      userId: memberRoleToChange.userId,
      newRole
    });
  };

  const handleUpdateTeam = (teamId: string, updates: { name: string; description: string }) => {
    console.log('Updating team:', { teamId, updates });
    updateTeam({ teamId, updates });
  };

  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    
    try {
      console.log('Deleting team:', teamToDelete);
      deleteTeam(teamToDelete);
      setTeamToDelete(null);
      setActiveTeamTab(null);
    } catch (error: any) {
      console.error(`Failed to delete team:`, error);
    }
  };

  const userRole = (team: Team) => {
    if (!teamMembers || !user) {
      console.log(`No teamMembers data available for team ${team.id}`);
      return null;
    }
    
    const members = teamMembers[team.id] || [];
    console.log(`Getting userRole for team ${team.id}. Members:`, members);
    console.log(`Current user ID: ${user?.id}`);
    
    // Check if user is the team owner first
    if (team.owner_id === user.id) {
      console.log(`User is the owner of team ${team.id}`);
      return 'owner';
    }
    
    // Otherwise check team_members for role
    const currentMember = members.find(member => member.user_id === user.id);
    console.log(`Current member found:`, currentMember);
    
    return currentMember?.role || null;
  };

  if (isLoading) {
    console.log('TeamTab is loading...');
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('TeamTab encountered an error:', error);
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

  console.log('TeamTab rendering with teams:', teams);

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
            <Button onClick={() => {
              console.log('Create team button clicked');
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
                console.log('Team tab changed to:', value);
                setActiveTeamTab(value);
              }}
            >
              <TabsList className="mb-4">
                {teams.map(team => {
                  const role = userRole(team);
                  console.log(`Team ${team.id} (${team.name}) - User role: ${role}`);
                  
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

              {teams.map(team => {
                const role = userRole(team);
                const members = teamMembers?.[team.id];
                const teamInvitations = invitations?.[team.id];
                
                console.log(`Rendering TeamDetails for ${team.id} (${team.name}):`, {
                  role,
                  members,
                  teamInvitations
                });
                
                return (
                  <TabsContent key={team.id} value={team.id} className="space-y-4">
                    <TeamDetails 
                      team={team}
                      teamMembers={members}
                      invitations={teamInvitations}
                      userRole={role}
                      currentUserId={user?.id}
                      onOpenInvite={openInviteDialog}
                      onDeleteTeam={setTeamToDelete}
                      onRemoveMember={(teamId, userId, name) => {
                        console.log('Remove member requested:', { teamId, userId, name });
                        setMemberToRemove({ teamId, userId, name });
                      }}
                      onUpdateTeam={handleUpdateTeam}
                      onUpdateMemberRole={(teamId, userId, name, currentRole, newRole) => {
                        console.log('Update role requested:', { teamId, userId, name, currentRole, newRole });
                        setMemberRoleToChange({ teamId, userId, name, currentRole });
                        updateTeamMemberRole({ teamId, userId, newRole });
                      }}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <EmptyTeamState onCreateTeam={() => {
          console.log('Create team button clicked from empty state');
          setIsCreateTeamDialogOpen(true);
        }} />
      )}

      {/* Dialogs */}
      <TeamCreationDialog 
        isOpen={isCreateTeamDialogOpen} 
        onOpenChange={(isOpen) => {
          console.log('Team creation dialog state changed to:', isOpen);
          setIsCreateTeamDialogOpen(isOpen);
        }} 
      />
      
      <InvitationDialog 
        isOpen={isInviteDialogOpen} 
        onOpenChange={(isOpen) => {
          console.log('Invitation dialog state changed to:', isOpen);
          setIsInviteDialogOpen(isOpen);
        }}
        teamId={selectedTeamId}
      />
      
      <RemoveMemberDialog
        isOpen={!!memberToRemove}
        onOpenChange={(isOpen) => {
          console.log('Remove member dialog state changed to:', isOpen);
          if (!isOpen) setMemberToRemove(null);
        }}
        memberName={memberToRemove?.name || 'this user'}
        onConfirm={handleRemoveMember}
      />
      
      <DeleteTeamDialog
        isOpen={!!teamToDelete}
        onOpenChange={(isOpen) => {
          console.log('Delete team dialog state changed to:', isOpen);
          if (!isOpen) setTeamToDelete(null);
        }}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
};

export default TeamTab;
