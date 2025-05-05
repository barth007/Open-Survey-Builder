
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Profile } from '@/hooks/useProfile';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Camera, X } from 'lucide-react';

interface PersonalInfoTabProps {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const PersonalInfoTab = ({ profile, updateProfile }: PersonalInfoTabProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  console.log("PersonalInfoTab rendering with profile:", profile);
  
  useEffect(() => {
    // Update local state when profile changes
    if (profile) {
      setFullName(profile.full_name || '');
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
        avatar_url: avatarUrl
      });

      if (success) {
        toast("Your profile has been updated successfully.");
        setIsEditing(false); // Switch to non-edit mode after saving
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("There was an error updating your profile.");
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

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      
      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        throw error;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update the avatar URL in state
      setAvatarUrl(publicUrl);
      
      toast("Avatar uploaded successfully!");
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast("Failed to upload avatar: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearAvatarUrl = () => {
    setAvatarUrl('');
  };

  return (
    <Card className="overflow-hidden">
      <div className="space-y-6 bg-white p-6 rounded-lg">
        {/* Display Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              className={`w-20 h-20 border-2 border-muted ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={isEditing ? handleAvatarClick : undefined}
            >
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </Avatar>
            {isEditing && avatarUrl && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                onClick={clearAvatarUrl}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={isUploading}
          />
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
                <label className="block text-sm font-medium">Avatar URL (optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can paste an image URL or upload by clicking on the avatar above
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="text"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving || isUploading}>
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
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email</h3>
                <p className="font-medium">{profile?.email || user?.email || 'Not set'}</p>
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
