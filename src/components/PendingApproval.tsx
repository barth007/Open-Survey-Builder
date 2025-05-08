
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const PendingApproval = () => {
  const { signOut, isLoading, user, checkApprovalStatus } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [sessionStabilized, setSessionStabilized] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const checkUserStatus = async () => {
    if (!user || checkingStatus) return;
    
    try {
      setCheckingStatus(true);
      console.log('PendingApproval: Checking approval status for user:', user.id);
      
      // Use the centralized approval status check
      const status = await checkApprovalStatus();
      
      // If the user has been approved, redirect to dashboard
      if (status === 'approved') {
        console.log('User is now approved, redirecting to dashboard');
        toast.success('Your account has been approved!', {
          description: 'You can now access the application.'
        });
        
        navigate('/dashboard', { replace: true });
      } else if (status === 'pending') {
        // If still pending, show a message
        toast.info('Your request is still being reviewed', {
          description: 'Please check back later.'
        });
      } else if (status === 'rejected') {
        // If rejected, show a message and redirect to home
        toast.error('Your access request was denied', {
          description: 'Please contact an administrator for more information.'
        });
        navigate('/', { replace: true });
      } else if (status === 'unknown') {
        // If unknown status (profile might not exist), redirect to home
        toast.error('Unable to determine account status', {
          description: 'Redirecting to home page to recreate profile.'
        });
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Error during approval status check:', err);
      toast.error('Error checking approval status', {
        description: 'Please try again later'
      });
    } finally {
      setCheckingStatus(false);
      setInitialCheckComplete(true);
    }
  };
  
  // Add delay to initial session stabilization
  useEffect(() => {
    const timer = setTimeout(() => {
      setSessionStabilized(true);
    }, 2000); // Give session 2 seconds to stabilize
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check status once when component mounts and session is stable
  useEffect(() => {
    // Only check status when user is loaded and session is stabilized
    if (user && !isLoading && sessionStabilized && !initialCheckComplete) {
      checkUserStatus();
    }
  }, [user, isLoading, sessionStabilized, initialCheckComplete]);
  
  // If still loading or waiting for session to stabilize, show loading state
  if (isLoading || !sessionStabilized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }
  
  // If no user is logged in, redirect to login
  useEffect(() => {
    if (!isLoading && !user && initialCheckComplete) {
      console.log('No user found on pending page, redirecting to login');
      navigate('/login');
    }
  }, [user, isLoading, navigate, initialCheckComplete]);
  
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
            <p className="text-lg font-medium">Your request is still being reviewed</p>
            <p className="text-muted-foreground">
              Please check back later.
            </p>
            
            {checkingStatus ? (
              <div className="flex items-center gap-2 mt-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-sm text-muted-foreground">Checking approval status...</span>
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={checkUserStatus}
            disabled={checkingStatus}
            className="flex items-center gap-2"
          >
            {checkingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Check Status
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingApproval;
