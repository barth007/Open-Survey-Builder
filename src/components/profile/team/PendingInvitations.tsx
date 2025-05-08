
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamInvitation } from '@/types/team-types';

interface PendingInvitationsProps {
  invitations: TeamInvitation[];
}

export const PendingInvitations = ({ invitations }: PendingInvitationsProps) => {
  if (!invitations || invitations.length === 0) return null;
  
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map(invitation => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>{new Date(invitation.created_at || '').toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
