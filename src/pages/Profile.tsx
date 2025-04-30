
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import TeamTab from '@/components/profile/TeamTab';
import AccountSettingsTab from '@/components/profile/AccountSettingsTab';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "team" | "settings">("personal");
  const { profile, loading, error, updateProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error loading profile: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-abyss">Your Profile</h1>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "personal" | "team" | "settings")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-ice">
            <TabsTrigger value="personal" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Personal Info</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Team</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Settings</TabsTrigger>
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
