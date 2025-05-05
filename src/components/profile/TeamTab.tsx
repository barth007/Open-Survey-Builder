
import React, { useState } from 'react';
import { Users, Plus, Mail } from 'lucide-react';
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

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const TeamTab = () => {
  const { user } = useAuth();
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  
  // Set up form for invite functionality
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast("Please enter a team name");
      return;
    }

    try {
      setIsCreatingTeam(true);
      // In a future implementation, we'll add the actual team creation logic
      // using Supabase here
      
      toast("Team creation will be implemented in the next update");
      setIsCreateTeamDialogOpen(false);
      setTeamName('');
    } catch (error: any) {
      toast("Failed to create team: " + (error.message || "Unknown error"));
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleInvite = async (data: InviteFormValues) => {
    try {
      // In a future implementation, we'll add the actual invite logic
      // using Supabase and email functionality here
      
      toast(`Invitation to ${data.email} will be implemented in the next update`);
      setIsInviteDialogOpen(false);
      inviteForm.reset();
    } catch (error: any) {
      toast("Failed to send invitation: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Team creation section */}
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

      {/* Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Manage your team invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-lg">
            <Mail className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              No pending invitations
            </p>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Team</DialogTitle>
            <DialogDescription>
              Create a team to collaborate on surveys with other users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="team-name">Team Name</label>
              <Input 
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateTeam} disabled={isCreatingTeam}>
              {isCreatingTeam ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
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
    </div>
  );
};

export default TeamTab;
