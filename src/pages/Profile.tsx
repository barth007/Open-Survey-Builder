
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import TeamTab from '@/components/profile/TeamTab';
import AccountSettingsTab from '@/components/profile/AccountSettingsTab';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "team" | "settings">("personal");
  const { profile, loading, error, updateProfile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("Profile page rendering with:", { 
    userId: user?.id,
    profileId: profile?.id,
    loading, 
    error, 
    activeTab 
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your profile.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 max-w-md mx-auto rounded-md shadow-md bg-destructive/10">
          <h2 className="text-xl font-bold mb-2 text-destructive">Error Loading Profile</h2>
          <p className="text-destructive-foreground mb-4">{error.message}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "personal" | "team" | "settings")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <PersonalInfoTab profile={profile} updateProfile={updateProfile} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <TeamTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AccountSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
