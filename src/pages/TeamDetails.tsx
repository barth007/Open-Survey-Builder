import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '@/hooks/useTeam';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { team, members, invitations, isLoading, error } = useTeam(id!);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor' | 'viewer'>('viewer');

  const inviteMember = useMutation({
    mutationFn: async () => {
      if (!inviteEmail.trim()) throw new Error('Please enter a valid email.');
      if (!team) throw new Error('Team not loaded.');

      const alreadyMember = members.some((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase());
      const alreadyInvited = invitations.some((i) => i.email.toLowerCase() === inviteEmail.trim().toLowerCase());

      if (alreadyMember) throw new Error('This user is already a member.');
      if (alreadyInvited) throw new Error('This user has already been invited.');

      const { error } = await supabase
        .from('team_invitations')
        .insert([
          {
            team_id: id!,
            email: inviteEmail.trim(),
            role: inviteRole,
            accepted: false,
          }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation sent');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      setInviteEmail('');
      setInviteRole('viewer');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading team...</div>;
  }

  if (error || !team) {
    return <div className="flex items-center justify-center min-h-screen text-destructive">Error loading team</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{team.name}</h1>
      </div>

      {/* Invite Section */}
      <div className="border p-4 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Invite a New Member</h2>
        <Input
          placeholder="User Email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <Select
          value={inviteRole}
          onValueChange={(value) => setInviteRole(value as 'owner' | 'editor' | 'viewer')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => inviteMember.mutate()}
          disabled={inviteMember.isPending}
          className="w-full"
        >
          {inviteMember.isPending ? 'Inviting...' : 'Invite Member'}
        </Button>
      </div>

      {/* Members List */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          {members.length === 0 ? (
            <p className="text-muted-foreground">No members yet.</p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition"
                >
                  <Avatar>
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.full_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{member.full_name || member.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground capitalize">{member.role}</p>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMember.mutate(member.id)}
                    disabled={removeMember.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitations List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
          {invitations.length === 0 ? (
            <p className="text-muted-foreground">No pending invitations.</p>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition"
                >
                  <div>
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{invitation.role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Pending</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
