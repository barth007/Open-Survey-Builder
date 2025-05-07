
import React from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
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

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string | null;
}

export const InvitationDialog = ({ isOpen, onOpenChange, teamId }: InvitationDialogProps) => {
  const { sendInvitation, isSending } = useTeams();
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleInvite = async (data: InviteFormValues) => {
    if (!teamId) {
      toast('No team selected');
      return;
    }
    
    console.log('Sending invitation to', data.email, 'for team', teamId);
    
    try {
      await sendInvitation({ teamId, email: data.email });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error caught in InvitationDialog:', error);
      toast(`Failed to send invitation: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on surveys.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
            <FormField
              control={form.control}
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
                <Button type="button" variant="outline" disabled={isSending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
