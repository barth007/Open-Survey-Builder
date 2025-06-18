import { debugLog, debugWarn } from '@/lib/logger';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import TeamTab from '@/components/profile/TeamTab';
import AccountSettingsTab from '@/components/profile/AccountSettingsTab';
import { Loader2, User, Users, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "team" | "settings">("personal");
  const { profile, loading, error, updateProfile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  debugLog("Profile page rendering with:", { 
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
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-4 p-2 flex items-center text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Your Profile</h1>
          </div>
        </header>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "personal" | "team" | "settings")} 
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Info</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <PersonalInfoTab profile={profile} updateProfile={updateProfile} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-6">
            <TeamTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <AccountSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
