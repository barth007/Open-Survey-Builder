
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface WelcomePageProps {
  title?: string;
  message?: string;
  onStart: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ 
  title = "Welcome to this survey",
  message = "Thank you for taking the time to fill out this survey. Your feedback is important to us.",
  onStart
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {message && <CardDescription className="text-base mt-2">{message}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click the button below to begin the survey.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full md:w-auto">
          Start Survey
        </Button>
      </CardFooter>
    </Card>
  );
};
