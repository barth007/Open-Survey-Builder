
import React from 'react';
import { Trash } from 'lucide-react';
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

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  userRole: string | null;
  onRemoveMember: (memberId: string, memberName: string | null) => void;
}

export const TeamMembersList = ({
  teamMembers,
  currentUserId,
  userRole,
  onRemoveMember
}: TeamMembersListProps) => {
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
              {(userRole === 'owner' || userRole === 'admin') && (
                <TableHead className="w-[80px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map(member => (
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
                {(userRole === 'owner' || userRole === 'admin') && (
                  <TableCell>
                    {member.user_id !== currentUserId && 
                      (member.role !== 'owner' || userRole === 'owner') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemoveMember(member.user_id, member.profile?.full_name)}
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
  );
};
