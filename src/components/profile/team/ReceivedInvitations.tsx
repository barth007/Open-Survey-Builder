
import React from 'react';
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
import { TeamInvitation } from '@/types/team-types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ReceivedInvitationsProps {
  invitations: TeamInvitation[];
  onAccept: (invitationId: string) => void;
  onReject: (invitationId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const ReceivedInvitations = ({ 
  invitations, 
  onAccept, 
  onReject, 
  isAccepting,
  isRejecting
}: ReceivedInvitationsProps) => {
  if (!invitations || invitations.length === 0) return null;
  
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Team Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map(invitation => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.team?.name || 'Unknown Team'}</TableCell>
                <TableCell>{invitation.team?.description || '-'}</TableCell>
                <TableCell>{new Date(invitation.created_at || '').toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={isAccepting || isRejecting}
                      onClick={() => onAccept(invitation.id)}
                    >
                      {isAccepting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Accept</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isAccepting || isRejecting}
                      onClick={() => onReject(invitation.id)}
                    >
                      {isRejecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>Decline</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
