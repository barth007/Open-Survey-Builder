
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTeam } from '@/hooks/useTeam';
import { useSimpleTeams } from '@/hooks/useSimpleTeams';
import { Plus, Users } from 'lucide-react';

export function Teams() {
  const navigate = useNavigate();
  const { createTeam } = useTeam();
  const { teams, isLoading } = useSimpleTeams();
  
  const handleCreateTeam = async () => {
    try {
      await createTeam.mutateAsync('New Team');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
          <p className="text-sm text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>Created {new Date(team.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <Users className="w-4 h-4 mr-2" />
                View Team
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Create a Team</CardTitle>
            <CardDescription>Start collaborating with others on surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateTeam} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
