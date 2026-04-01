import { debugLog, debugWarn } from '@/lib/logger';

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
import { getErrorMessage } from '@/lib/error-utils';

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface ExistingMember {
  user_id: string;
  email?: string | null;
  name?: string | null;
  role: string;
}

interface InvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string | null;
  existingMembers?: ExistingMember[];
}

export const InvitationDialog = ({ isOpen, onOpenChange, teamId, existingMembers }: InvitationDialogProps) => {
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

    debugLog('Sending invitation to', data.email, 'for team', teamId);

    try {
      await sendInvitation({ teamId, email: data.email });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error caught in InvitationDialog:', error);
      toast(`Failed to send invitation: ${getErrorMessage(error)}`);
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

        {existingMembers && existingMembers.length > 0 && (
          <div className="space-y-1 rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Already in this team:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {existingMembers.map(m => (
                <li key={m.user_id}>{m.email || m.name || m.user_id}</li>
              ))}
            </ul>
          </div>
        )}

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
