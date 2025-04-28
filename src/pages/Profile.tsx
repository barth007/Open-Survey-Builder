
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '@/hooks/useTeams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/components/UserProfile';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: teams, isLoading: loadingTeams, error: teamsError } = useTeams();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user information...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>
      
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>{user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-xl font-semibold">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="ml-auto">
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Teams</CardTitle>
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
