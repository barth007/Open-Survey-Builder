
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeamTab = () => {
  console.log("TeamTab rendering");
  
  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2">
        <CardHeader>
          <div className="flex items-center justify-center">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-center">Team Management</CardTitle>
          <CardDescription className="text-center">
            This feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Soon you'll be able to create teams, invite collaborators, and manage permissions for your surveys.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Create a Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Create a new team and invite members to collaborate on surveys.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Join a Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Accept invitations and join existing teams to collaborate.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamTab;
