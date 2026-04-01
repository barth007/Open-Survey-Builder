import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/providers/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Settings, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BackButton } from '@/components/ui/BackButton';
import { getErrorMessage } from '@/lib/error-utils';

interface ProfileRequest {
  id: string;
  name: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  updatedAt: string | null;
}

type PendingAction = { id: string; name: string | null; action: 'approved' | 'rejected' } | null;

const AdminPanel = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [profile]);

  // Query to fetch pending access requests
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      return apiFetch('/auth/admin/pending');
    },
    enabled: isAdmin
  });

  // Mutation to update profile status
  const updateProfileStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      return apiFetch(`/auth/admin/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success(`User ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`);
    },
    onError: (error: unknown) => {
      toast.error("Failed to update user status", { description: getErrorMessage(error) });
    }
  });

  const handleApprove = (id: string, name: string | null) => {
    setPendingAction({ id, name, action: 'approved' });
  };

  const handleReject = (id: string, name: string | null) => {
    setPendingAction({ id, name, action: 'rejected' });
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    updateProfileStatus.mutate({ id: pendingAction.id, status: pendingAction.action });
    setPendingAction(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-14 items-center gap-4">
          <BackButton to="/dashboard" label="Back" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-bold">Admin Panel</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Manage user access requests and system permissions.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pending Access Requests</CardTitle>
            <CardDescription>Review users who have recently signed up and are waiting for approval.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner className="py-12" />
            ) : (
              <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="rounded-md border">
                {(() => {
                  const q = search.toLowerCase();
                  const displayedRequests = (pendingRequests ?? []).filter((r: ProfileRequest) =>
                    !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
                  );
                  return !displayedRequests || displayedRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>No pending access requests.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">User Information</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold">Requested On</TableHead>
                        <TableHead className="text-right font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedRequests.map((request: ProfileRequest) => (
                        <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{request.name || 'Anonymous'}</span>
                              <span className="text-sm text-muted-foreground">{request.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request.id, request.name)}
                                disabled={updateProfileStatus.isPending}
                                className="font-bold"
                              >
                                <X className="h-4 w-4 mr-1" /> Deny
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request.id, request.name)}
                                disabled={updateProfileStatus.isPending}
                                className="font-bold"
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
                })()}
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === 'approved' ? 'Approve' : 'Deny'} access for {pendingAction?.name || 'this user'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === 'approved'
                ? 'The user will be granted access and can log in immediately.'
                : 'The user will be denied access and cannot log in.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={pendingAction?.action === 'rejected' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              onClick={handleConfirmAction}
            >
              {pendingAction?.action === 'approved' ? 'Approve' : 'Deny'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
