
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types/team-types';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { TeamMemberRow } from './TeamMemberRow';

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
  
  useEffect(() => {
    console.log('TeamMembersList rendered with:', {
      teamMembersCount: teamMembers?.length,
      teamMembers,
      currentUserId,
      userRole
    });

    // Log if the current user is in the members list
    if (teamMembers && currentUserId) {
      const currentUserMember = teamMembers.find(member => member.user_id === currentUserId);
      console.log('Current user in members list?', 
        currentUserMember 
          ? `Yes, with role: ${currentUserMember.role}` 
          : 'No');
    }
  }, [teamMembers, currentUserId, userRole]);

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  console.log('TeamMembersList: Can manage members?', canManageMembers);
  console.log('TeamMembersList: Is owner?', isOwner);

  // Check if we have a valid array of team members
  if (!teamMembers || !Array.isArray(teamMembers)) {
    console.log('TeamMembersList: Invalid team members data', teamMembers);
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load team members data.</p>
        </CardContent>
      </Card>
    );
  }

  // If the array is empty but valid, show a different message
  if (teamMembers.length === 0) {
    console.log('TeamMembersList: No team members found in the array');
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This team has no members yet.</p>
        </CardContent>
      </Card>
    );
  }

  const handleMemberRoleChange = (userId: string, name: string | null, currentRole: string) => {
    console.log('TeamMembersList: Setting member to change role', {
      userId,
      name,
      role: currentRole
    });
    setMemberToChangeRole({
      userId,
      name,
      role: currentRole
    });
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Team Members ({teamMembers.length})</CardTitle>
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
              // Modified logic: don't allow owners to manage other owners or admins to manage owners/admins
              const canManageThisMember = 
                (isOwner || (userRole === 'admin' && member.role !== 'owner' && member.role !== 'admin')) && 
                !isCurrentUser;
              
              console.log('TeamMembersList: Member details', {
                memberId: member.id,
                memberUserId: member.user_id,
                memberRole: member.role,
                memberName: member.profile?.full_name,
                isCurrentUser,
                canManageThisMember
              });
              
              return (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  isCurrentUser={isCurrentUser}
                  canManageThisMember={canManageThisMember}
                  userRole={userRole}
                  onRemoveMember={onRemoveMember}
                  onChangeRole={handleMemberRoleChange}
                />
              );
            })}
          </TableBody>
        </Table>
        
        {/* Role Change Dialog */}
        {memberToChangeRole && (
          <ChangeRoleDialog
            isOpen={!!memberToChangeRole}
            onOpenChange={(isOpen) => {
              console.log('TeamMembersList: Role dialog open state changed to', isOpen);
              if (!isOpen) setMemberToChangeRole(null);
            }}
            memberName={memberToChangeRole.name}
            currentRole={memberToChangeRole.role}
            onConfirm={(newRole) => {
              console.log('TeamMembersList: Role change confirmed', {
                userId: memberToChangeRole.userId,
                name: memberToChangeRole.name,
                oldRole: memberToChangeRole.role,
                newRole
              });
              onChangeRole(memberToChangeRole.userId, memberToChangeRole.name, memberToChangeRole.role);
              setMemberToChangeRole(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
