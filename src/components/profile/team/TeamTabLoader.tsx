
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamTabLoaderProps {
  isLoading: boolean;
  error: Error | null;
}

export const TeamTabLoader = ({ isLoading, error }: TeamTabLoaderProps) => {
  if (isLoading) {
    console.log('TeamTabLoader: Loading teams...');
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('TeamTabLoader: Error encountered:', error);
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
