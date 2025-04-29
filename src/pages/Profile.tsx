
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '@/hooks/useTeams';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: loadingProfile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast: toastUI } = useToast(); // renamed to avoid conflict with sonner toast
  const { data: teams, isLoading: loadingTeams, error: teamsError } = useTeams();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !loadingProfile) {
      console.log("No user found, redirecting to login");
      toast('Authentication Required', {
        description: 'Please log in to view your profile'
      });
      navigate('/login');
    }
  }, [user, loadingProfile, navigate]);

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      console.log('Setting profile form data:', profile);
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setFullName(profile?.full_name || '');
      setBio(profile?.bio || '');
      setWebsite(profile?.website || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        full_name: fullName,
        bio,
        website
      });
      
      if (result) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toastUI({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>
      
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage how your information appears across the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">Profile photo</p>
            </div>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      placeholder="A short bio about yourself"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="pt-2 flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleEditToggle}>Cancel</Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p className="mt-1">{profile?.full_name || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="mt-1">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                    <p className="mt-1">{profile?.bio || 'No bio added yet'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                    <p className="mt-1">
                      {profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {profile.website}
                        </a>
                      ) : (
                        'No website added yet'
                      )}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={handleEditToggle}>Edit Profile</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Account created via {user.app_metadata.provider || 'email'}
          </p>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      {/* Teams Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Teams</CardTitle>
            <CardDescription>Teams you are a member of</CardDescription>
          </div>
          <Button size="sm" onClick={() => navigate('/teams/create')}>
            <Plus className="h-4 w-4 mr-1" />
            Create Team
          </Button>
        </CardHeader>
        <CardContent>
          {loadingTeams ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : teamsError ? (
            <p className="text-destructive p-2">Error loading teams</p>
          ) : (teams?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground p-2">You are not a member of any teams yet.</p>
          ) : (
            <div className="space-y-4">
              {teams?.map((team) => (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-muted-foreground">Role: {team.role}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teams/${team.id}`);
                    }}>
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
