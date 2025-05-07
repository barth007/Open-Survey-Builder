
import React from 'react';
import { Trash, Shield, ShieldOff, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamMember } from '@/types/team-types';

interface TeamMemberRowProps {
  member: TeamMember;
  isCurrentUser: boolean;
  canManageThisMember: boolean;
  userRole: string | null;
  onRemoveMember: (userId: string, name: string | null) => void;
  onChangeRole: (userId: string, name: string | null, currentRole: string) => void;
}

export const TeamMemberRow = ({
  member,
  isCurrentUser,
  canManageThisMember,
  userRole,
  onRemoveMember,
  onChangeRole
}: TeamMemberRowProps) => {
  const isMemberOwner = member.role === 'owner';
  const isOwner = userRole === 'owner';
  
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableRow>
      <TableCell className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.profile?.avatar_url || undefined} />
          <AvatarFallback>{getInitials(member.profile?.full_name)}</AvatarFallback>
        </Avatar>
        <span>
          {member.profile?.full_name || 'Unknown User'}
          {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
        </span>
      </TableCell>
      <TableCell>{member.profile?.email || 'No email'}</TableCell>
      <TableCell>
        <Badge variant={isMemberOwner ? 'default' : (member.role === 'admin' ? 'secondary' : 'outline')}>
          {member.role}
        </Badge>
      </TableCell>
      {(userRole === 'owner' || userRole === 'admin') && (
        <TableCell className="text-right">
          {canManageThisMember ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && member.role !== 'owner' && (
                  <DropdownMenuItem
                    onClick={() => {
                      console.log('TeamMemberRow: Change role clicked', {
                        userId: member.user_id,
                        name: member.profile?.full_name,
                        role: member.role
                      });
                      onChangeRole(member.user_id, member.profile?.full_name || null, member.role);
                    }}
                    className="flex items-center"
                  >
                    {member.role === 'admin' ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        <span>Remove Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Make Admin</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    console.log('TeamMemberRow: Remove member clicked', {
                      userId: member.user_id,
                      name: member.profile?.full_name
                    });
                    onRemoveMember(member.user_id, member.profile?.full_name);
                  }}
                  className="flex items-center text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  <span>Remove</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};
