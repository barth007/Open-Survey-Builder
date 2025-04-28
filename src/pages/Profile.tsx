import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTeams } from '@/hooks/useTeams';
import { Plus } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: teams, isLoading, error } = useTeams();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
          <AvatarFallback>{user.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xl font-semibold">{user.user_metadata?.full_name || user.email}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Teams</h2>
          <Button size="sm" onClick={() => navigate('/teams/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create Team
          </Button>
        </div>

        {isLoading ? (
          <p>Loading teams...</p>
        ) : error ? (
          <p className="text-destructive">Error loading teams</p>
        ) : teams?.length === 0 ? (
          <p className="text-muted-foreground">You are not a member of any teams yet.</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                <p className="font-semibold">{team.name}</p>
                <p className="text-sm text-muted-foreground">Role: {team.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
