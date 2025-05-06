
import React, { useState } from 'react';
import { Trash, Shield, ShieldOff, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TeamMember } from '@/types/team-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeRoleDialog } from './ChangeRoleDialog';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  userRole: string | null;
  onRemoveMember: (memberId: string, memberName: string | null) => void;
  onChangeRole: (memberId: string, memberName: string | null, currentRole: string) => void;
}

export const TeamMembersList = ({
  teamMembers,
  currentUserId,
  userRole,
  onRemoveMember,
  onChangeRole
}: TeamMembersListProps) => {
  const [memberToChangeRole, setMemberToChangeRole] = useState<{
    userId: string,
    name: string | null,
    role: string
  } | null>(null);
  
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  return (
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
              {canManageMembers && (
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map(member => {
              const isCurrentUser = member.user_id === currentUserId;
              const isMemberOwner = member.role === 'owner';
              const canManageThisMember = 
                (isOwner || (userRole === 'admin' && member.role !== 'owner' && member.role !== 'admin')) && 
                !isCurrentUser;
              
              return (
                <TableRow key={member.id}>
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
                  {canManageMembers && (
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
                                onClick={() => setMemberToChangeRole({
                                  userId: member.user_id,
                                  name: member.profile?.full_name || null,
                                  role: member.role
                                })}
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
                              onClick={() => onRemoveMember(member.user_id, member.profile?.full_name)}
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
            })}
          </TableBody>
        </Table>
        
        {/* Role Change Dialog */}
        {memberToChangeRole && (
          <ChangeRoleDialog
            isOpen={!!memberToChangeRole}
            onOpenChange={(isOpen) => !isOpen && setMemberToChangeRole(null)}
            memberName={memberToChangeRole.name}
            currentRole={memberToChangeRole.role}
            onConfirm={(newRole) => {
              onChangeRole(memberToChangeRole.userId, memberToChangeRole.name, memberToChangeRole.role);
              setMemberToChangeRole(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
