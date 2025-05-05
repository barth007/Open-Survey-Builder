
import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/hooks/useProfile';

interface PersonalInfoTabProps {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const PersonalInfoTab = ({ profile, updateProfile }: PersonalInfoTabProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  // Handle form submission to update the profile
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const success = await updateProfile({
        full_name: fullName,
        bio,
        website,
        avatar_url: avatarUrl
      });

      if (success) {
        toast("Profile updated", { description: "Your profile has been updated successfully." });
        setIsEditing(false); // Switch to non-edit mode after saving
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("Profile Update Error", {
        description: "There was an error updating your profile."
      });
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Display Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl || profile?.avatar_url || ''} />
          <AvatarFallback>{profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold">{profile?.full_name || 'Your Name'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your bio"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Website</label>
              <Input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Enter your website URL"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Avatar URL</label>
              <Input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Enter avatar URL"
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p><strong>Full Name:</strong> {profile?.full_name || 'Not set'}</p>
            <p><strong>Bio:</strong> {profile?.bio || 'No bio yet'}</p>
            <p><strong>Website:</strong> {profile?.website || 'No website yet'}</p>
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoTab;
