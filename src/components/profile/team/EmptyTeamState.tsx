
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyTeamStateProps {
  onCreateTeam: () => void;
}

export const EmptyTeamState = ({ onCreateTeam }: EmptyTeamStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Teams
        </CardTitle>
        <CardDescription>Create and manage your teams</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
          <Users className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No Teams Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create a team to collaborate with others on surveys
          </p>
          <Button onClick={onCreateTeam}>
            <Plus className="h-4 w-4 mr-2" />
            Create a Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
