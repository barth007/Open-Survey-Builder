
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/card';

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
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Update local state when profile changes
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Handle form submission to update the profile
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <Card className="overflow-hidden">
      <div className="space-y-6 bg-white p-6 rounded-lg">
        {/* Display Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-muted">
            <AvatarImage src={avatarUrl || ''} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
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
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Website</label>
                <Input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Avatar URL</label>
                <Input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-muted/30 p-6 rounded-lg">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Full Name</h3>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Bio</h3>
                <p>{profile?.bio || 'No bio yet'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Website</h3>
                <p>
                  {profile?.website ? (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    'No website yet'
                  )}
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoTab;
