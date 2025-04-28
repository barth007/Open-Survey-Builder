
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const { teams, isLoading, error } = useTeams(); // Now correctly destructures teams
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error('Failed to load user');
        return;
      }
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/login');
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{user.email[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xl font-semibold">{user.user_metadata?.full_name || user.email}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <Button variant="destructive" onClick={handleSignOut}>
        Sign Out
      </Button>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Teams</h2>

        {isLoading ? (
          <p>Loading teams...</p>
        ) : error ? (
          <p className="text-destructive">Error loading teams</p>
        ) : teams.length === 0 ? (
          <p className="text-muted-foreground">You are not part of any teams yet.</p>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{team.role}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  Manage
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
