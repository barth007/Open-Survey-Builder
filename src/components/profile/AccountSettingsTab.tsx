
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const AccountSettingsTab = () => {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast("Signed out", {
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast("Error", {
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
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
            <Switch id="notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Product Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and improvements
              </p>
            </div>
            <Switch id="marketing" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
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
            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettingsTab;
