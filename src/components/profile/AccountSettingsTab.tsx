import { debugLog, debugWarn } from '@/lib/logger';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';

const AccountSettingsTab = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  debugLog("AccountSettingsTab rendering");
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast("You have been signed out successfully.");
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast("There was a problem signing out. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      toast("Passwords don't match.");
      return;
    }
    
    if (password.length < 6) {
      toast("Password must be at least 6 characters.");
      return;
    }
    
    try {
      setIsUpdatingPassword(true);
      await apiFetch('/auth/password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          password,
        }),
      });
      
      toast("Password updated successfully!");
      setIsPasswordDialogOpen(false);
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast("Failed to change password: " + (error.message || "Unknown error"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      toast("Account deletion will be implemented in a future update");
      setIsDeleteAccountDialogOpen(false);
    } catch (error: any) {
      toast("Error: " + (error.message || "Unknown error"));
    }
  };
  
  const handleDownloadData = () => {
    toast("Data export will be implemented in a future update");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage your email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Survey Responses</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for new survey responses
              </p>
            </div>
            <Switch 
              id="notifications" 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Product Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and improvements
              </p>
            </div>
            <Switch 
              id="marketing" 
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast("Two-factor authentication will be implemented in a future update")}
          >
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These actions cannot be undone. Please proceed with caution.
          </p>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadData}
            >
              Download My Data
            </Button>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
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
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-destructive">
              All your data, including surveys and responses, will be permanently deleted.
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type "DELETE" to confirm</Label>
              <Input
                id="delete-confirm"
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSettingsTab;
