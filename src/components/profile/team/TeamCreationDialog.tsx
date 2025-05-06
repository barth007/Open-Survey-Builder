
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useTeams } from '@/hooks/useTeams';
import { Loader2 } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamCreationDialog = ({ isOpen, onOpenChange }: TeamCreationDialogProps) => {
  const { createTeam } = useTeams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleCreateTeam = async (data: TeamFormValues) => {
    try {
      setIsSubmitting(true);
      await createTeam({
        name: data.name,
        description: data.description
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Team creation form error:', error);
      toast(`Failed to create team: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription>
            Create a team to collaborate on surveys with other users.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateTeam)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
