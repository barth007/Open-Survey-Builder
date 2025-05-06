import React, { useState } from 'react';
import { Users, Plus, Mail, Trash, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeams, Team, TeamMember } from '@/hooks/useTeams';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type TeamFormValues = z.infer<typeof teamSchema>;
type InviteFormValues = z.infer<typeof inviteSchema>;

const TeamTab = () => {
  const { user, session } = useAuth();
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ teamId: string; userId: string; name: string | null } | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const { 
    teams, 
    teamMembers, 
    invitations, 
    isLoading, 
    error,
    createTeam,
    sendInvitation,
    removeTeamMember,
    deleteTeam
  } = useTeams();
  
  // Set up form for team creation
  const teamForm = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Set up form for invite functionality
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleCreateTeam = async (data: TeamFormValues) => {
    try {
      // Check for valid authentication before attempting to create team
      if (!user || !session?.access_token) {
        toast("Authentication required", {
          description: "Please sign in again to create a team"
        });
        return;
      }
      
      // We now know that name is definitely defined because of the form validation
      createTeam({
        name: data.name, // Explicitly pass the name property
        description: data.description
      });
      setIsCreateTeamDialogOpen(false);
      teamForm.reset();
    } catch (error: any) {
      toast(`Failed to create team: ${error.message}`);
    }
  };

  const handleInvite = async (data: InviteFormValues) => {
    if (!selectedTeamId) return;
    
    try {
      sendInvitation({ teamId: selectedTeamId, email: data.email });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
    } catch (error: any) {
      toast(`Failed to send invitation: ${error.message}`);
    }
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
      toast(`Failed to remove member: ${error.message}`);
    }
  };

  const handleDeleteTeam = () => {
    if (!teamToDelete) return;
    
    try {
      deleteTeam(teamToDelete);
      setTeamToDelete(null);
      setActiveTeamTab(null);
    } catch (error: any) {
      toast(`Failed to delete team: ${error.message}`);
    }
  };

  const openInviteDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsInviteDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userRole = (team: Team) => {
    if (!teamMembers) return null;
    const members = teamMembers[team.id] || [];
    const currentMember = members.find(member => member.user_id === user?.id);
    return currentMember?.role || null;
  };

  // Initialize activeTeamTab with the first team's ID when teams are loaded
  React.useEffect(() => {
    if (teams && teams.length > 0 && !activeTeamTab) {
      setActiveTeamTab(teams[0].id);
    }
  }, [teams, activeTeamTab]);

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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{team.name}</h3>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                      )}
                    </div>
                    <div className="space-x-2">
                      {(userRole(team) === 'owner' || userRole(team) === 'admin') && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => openInviteDialog(team.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      )}
                      {userRole(team) === 'owner' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setTeamToDelete(team.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Team
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Team members */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            {(userRole(team) === 'owner' || userRole(team) === 'admin') && (
                              <TableHead className="w-[80px]">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers && teamMembers[team.id]?.map(member => (
                            <TableRow key={member.id}>
                              <TableCell className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                                  <AvatarFallback>{getInitials(member.profile?.full_name)}</AvatarFallback>
                                </Avatar>
                                <span>{member.profile?.full_name || 'Unknown User'}</span>
                              </TableCell>
                              <TableCell>{member.profile?.email || 'No email'}</TableCell>
                              <TableCell>
                                <Badge variant={member.role === 'owner' ? 'default' : 'outline'}>
                                  {member.role}
                                </Badge>
                              </TableCell>
                              {(userRole(team) === 'owner' || userRole(team) === 'admin') && (
                                <TableCell>
                                  {member.user_id !== user?.id && (
                                    member.role !== 'owner' || userRole(team) === 'owner') && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setMemberToRemove({
                                          teamId: team.id,
                                          userId: member.user_id,
                                          name: member.profile?.full_name || 'this user'
                                        })}
                                      >
                                        <Trash className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Pending invitations */}
                  {(userRole(team) === 'owner' || userRole(team) === 'admin') && invitations && invitations[team.id]?.length > 0 && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Pending Invitations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Email</TableHead>
                              <TableHead>Sent</TableHead>
                              <TableHead>Expires</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invitations[team.id]?.map(invitation => (
                              <TableRow key={invitation.id}>
                                <TableCell>{invitation.email}</TableCell>
                                <TableCell>{new Date(invitation.created_at || '').toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Teams
            </CardTitle>
            <CardDescription>Create and manage your teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
              <Users className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Teams Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Create a team to collaborate with others on surveys
              </p>
              <Button onClick={() => setIsCreateTeamDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create a Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Team</DialogTitle>
            <DialogDescription>
              Create a team to collaborate on surveys with other users.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...teamForm}>
            <form onSubmit={teamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={teamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Send Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on surveys.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="colleague@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(isOpen) => !isOpen && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the team? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Team Dialog */}
      <AlertDialog open={!!teamToDelete} onOpenChange={(isOpen) => !isOpen && setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? All team data will be permanently removed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamTab;
