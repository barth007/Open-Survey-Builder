import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider'; // Access authentication state
import { supabase } from '@/integrations/supabase/client'; // Supabase client
import { Button } from '@/components/ui/button'; // Your UI button component
import { Input } from '@/components/ui/input'; // Your UI input component
import { Textarea } from '@/components/ui/textarea'; // Your UI textarea component
import { toast } from '@/components/ui/sonner'; // Notification system
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // Avatar UI

const Profile = () => {
  const { user } = useAuth(); // Get current user from context
  const [profile, setProfile] = useState<any | null>(null); // Store the profile data
  const [isEditing, setIsEditing] = useState(false); // Track if the form is in edit mode
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch profile data when the component mounts
  useEffect(() => {
    if (!user) return; // If user is not logged in, skip fetching profile
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(); // Fetch the profile for the current user

        if (error) {
          throw error;
        }

        setProfile(data); // Set profile data in state
        setFullName(data?.full_name || '');
        setBio(data?.bio || '');
        setWebsite(data?.website || '');
        setAvatarUrl(data?.avatar_url || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast('Profile Fetch Error', {
          description: 'There was an error fetching your profile.',
        });
      }
    };
    fetchProfile();
  }, [user]);

  // Handle form submission to update the profile
  const handleSaveProfile = async () => {
    if (!user) return; // Ensure user is logged in

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          bio,
          website,
          avatar_url: avatarUrl,
        });

      if (error) {
        throw error;
      }

      toast('Profile updated', { description: 'Your profile has been updated successfully.' });
      setIsEditing(false); // Switch to non-edit mode after saving
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Profile Update Error', {
        description: 'There was an error updating your profile.',
      });
    }
  };

  // Handle avatar URL change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value); // Update avatar URL
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Display Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl || profile.avatar_url} />
          <AvatarFallback>{profile?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold">{profile.full_name}</h2>
          <p className="text-sm text-muted">{profile.email}</p>
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
                onChange={handleAvatarChange}
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
            <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
            <p><strong>Bio:</strong> {profile.bio || 'No bio yet'}</p>
            <p><strong>Website:</strong> {profile.website || 'No website yet'}</p>
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <Button variant="destructive" onClick={() => supabase.auth.signOut()}>
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;
