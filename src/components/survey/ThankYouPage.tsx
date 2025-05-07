
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ThankYouPageProps {
  title?: string;
  message?: string;
  buttonText?: string;
  redirectUrl?: string;
  onClose?: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ 
  title = "Thank you for your responses",
  message = "Your feedback has been submitted successfully.",
  buttonText = "Close",
  redirectUrl,
  onClose
}) => {
  useEffect(() => {
    // If we have a redirect URL, navigate after a short delay
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {message && <CardDescription className="text-base mt-2">{message}</CardDescription>}
      </CardHeader>
      <CardContent>
        {redirectUrl && (
          <p className="text-sm text-muted-foreground">
            You will be redirected in a few seconds...
          </p>
        )}
      </CardContent>
      <CardFooter>
        {!redirectUrl && onClose && (
          <Button onClick={onClose} className="w-full md:w-auto">
            {buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
