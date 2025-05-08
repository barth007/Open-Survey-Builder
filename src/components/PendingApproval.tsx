
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const PendingApproval = () => {
  const { signOut, isLoading, user } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  // Periodically check if the user's approval status has changed
  useEffect(() => {
    if (!user) return;
    
    let statusCheckInterval: NodeJS.Timeout;
    
    const checkApprovalStatus = async () => {
      if (!user) return;
      
      try {
        setCheckingStatus(true);
        console.log('Checking approval status for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking approval status:', error);
          return;
        }
        
        console.log('Current user status:', data?.status);
        
        // If the user has been approved, redirect to login
        if (data?.status === 'approved') {
          console.log('User is now approved, redirecting to login');
          toast.success('Your account has been approved!', {
            description: 'You can now log in to access the application.'
          });
          
          // Clear the interval before navigating
          clearInterval(statusCheckInterval);
          
          // Navigate to login page
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Error during approval status check:', err);
      } finally {
        setCheckingStatus(false);
        setStatusCheckCount(prev => prev + 1);
      }
    };
    
    // Do an immediate check when component mounts
    checkApprovalStatus();
    
    // Set up periodic checks every 15 seconds
    statusCheckInterval = setInterval(checkApprovalStatus, 15000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(statusCheckInterval);
    };
  }, [user, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Access Pending</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-lg font-medium">Your account is waiting for approval</p>
            <p className="text-muted-foreground">
              An administrator will review your access request shortly.
              We'll notify you when your account has been approved.
            </p>
            
            {checkingStatus ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking approval status...</span>
              </div>
            ) : statusCheckCount > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Automatically checking for approval every 15 seconds...
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingApproval;
