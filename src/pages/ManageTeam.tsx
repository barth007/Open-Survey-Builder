// src/pages/ManageTeam.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '@/hooks/useTeam';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const ManageTeam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { team, members, isLoading, error } = useTeam(id!);

  const [emails, setEmails] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor' | 'viewer'>('viewer');

  const inviteMembers = useMutation({
    mutationFn: async () => {
      if (!emails.trim()) throw new Error('Enter at least one email.');
      if (!team) throw new Error('Team not loaded.');

      const emailList = emails.split(',').map((e) => e.trim().toLowerCase());

      for (const email of emailList) {
        const alreadyMember = members.some((m) => m.email.toLowerCase() === email);
        if (alreadyMember) continue;

        const { data: user, error: userError } = await supabase
        .from('team_invitations')
        .insert([
          { 
            team_id: id!,
            email: inviteEmail.trim(),
            role: inviteRole,
            accepted: false // oppure non specificarlo perché è default
          }
        ]);
      

        if (userError) throw userError;
        if (!user) continue; // Skip users not found

        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{ team_id: id, user_id: user.id, role: inviteRole }]);

        if (memberError) throw memberError;
      }
    },
    onSuccess: () => {
      toast.success('Invitations sent');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      setEmails('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'owner' | 'editor' | 'viewer' }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error || !team) {
    return <div className="flex items-center justify-center min-h-screen text-destructive">Error loading team</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <Button variant="ghost" onClick={() => navigate('/profile')}>Back to Profile</Button>
      </div>

      {/* Invite Members */}
      <div className="space-y-4 border p-6 rounded-lg">
        <h2 className="text-lg font-semibold">Invite Members</h2>
        <Input
          placeholder="Emails separated by commas"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
        />
        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'owner' | 'editor' | 'viewer')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => inviteMembers.mutate()}
          disabled={inviteMembers.isPending}
        >
          {inviteMembers.isPending ? 'Inviting...' : 'Invite'}
        </Button>
      </div>

      {/* Members List */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Team Members</h2>

        {members.length === 0 ? (
          <p className="text-muted-foreground">No members yet.</p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{member.full_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-medium">{member.full_name || member.email}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>

                <Badge variant="outline" className="capitalize">
                  {member.role}
                </Badge>

                <Select
                  value={member.role}
                  onValueChange={(newRole) => changeRole.mutate({ userId: member.id, role: newRole as 'owner' | 'editor' | 'viewer' })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Change Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeMember.mutate(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeam;
