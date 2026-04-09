import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { apiFetch } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AccountSettingsTab = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();

  // Change password
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Download
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast('You have been signed out successfully.');
      navigate('/login');
    } catch (error) {
      toast('There was a problem signing out. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      toast("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters.');
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await apiFetch('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, password }),
      });
      toast('Password updated successfully.');
      setIsPasswordDialogOpen(false);
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error) {
      toast('Failed to change password: ' + getErrorMessage(error));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setIsDownloading(true);
      const data = await apiFetch('/auth/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Your data has been downloaded.');
    } catch (error) {
      toast('Failed to export data: ' + getErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast('Please enter your password to confirm.');
      return;
    }
    if (deleteConfirmation !== 'DELETE') {
      toast('Please type DELETE to confirm.');
      return;
    }
    try {
      setIsDeletingAccount(true);
      await apiFetch('/auth/profile', {
        method: 'DELETE',
        body: JSON.stringify({ currentPassword: deletePassword, confirmation: 'DELETE' }),
      });
      toast('Your account has been deleted.');
      await signOut();
      navigate('/login');
    } catch (error) {
      toast('Failed to delete account: ' + getErrorMessage(error));
    } finally {
      setIsDeletingAccount(false);
      setDeletePassword('');
      setDeleteConfirmation('');
    }
  };

  const closeDeleteDialog = () => {
    setIsDeleteAccountDialogOpen(false);
    setDeletePassword('');
    setDeleteConfirmation('');
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>Choose which emails you receive from us.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Survey Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified by email when someone submits a response.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={profile?.email_notifications ?? false}
                onCheckedChange={(checked) => updateProfile({ email_notifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Product Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and improvements.
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={profile?.marketing_emails ?? false}
                onCheckedChange={(checked) => updateProfile({ marketing_emails: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button variant="outline" className="w-full" disabled>
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>On the roadmap</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Export your data or close your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadData}
              disabled={isDownloading}
            >
              {isDownloading ? 'Preparing download…' : 'Download My Data'}
            </Button>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsDeleteAccountDialogOpen(true)}
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating…' : 'Update Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={isDeleteAccountDialogOpen} onOpenChange={(open) => { if (!open) closeDeleteDialog(); else setIsDeleteAccountDialogOpen(true); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This will permanently delete your account, surveys, and all associated data. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-destructive">
                All surveys, responses, and team data owned by you will be permanently removed.
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-password">Confirm with your password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  Type <span className="font-mono font-semibold">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || !deletePassword || deleteConfirmation !== 'DELETE'}
              >
                {isDeletingAccount ? 'Deleting…' : 'Delete Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AccountSettingsTab;
