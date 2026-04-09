import { debugLog, debugWarn } from '@/lib/logger';

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import EmailAuthForm from '@/components/auth/EmailAuthForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Login = () => {
  const { user, isLoading, session, checkApprovalStatus } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug current URL and search parameters
  useEffect(() => {
    debugLog('Login page loaded at:', window.location.href);

    // Only log URL details on first load
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      debugLog(`URL param: ${key} = ${value}`);
    }

    // Log hash parameters if present (often used for tokens)
    if (window.location.hash) {
      debugLog('Hash params present:', window.location.hash.substring(0, 20) + '...');
    }

    // Check local storage for session data
    try {
      const hasLocalStorage = !!window.localStorage;
      debugLog('LocalStorage available:', hasLocalStorage);

      if (hasLocalStorage) {
        const supabaseSession = localStorage.getItem('sb-gtzcjxzllsrtaieopsgc-auth-token');
        debugLog('Supabase session in storage:', !!supabaseSession);
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  }, []); // Only run once on component mount

  // Get the path to redirect to after login
  const from = location.state?.from || '/dashboard';

  // Handle authenticated user and redirection
  useEffect(() => {
    // Don't try to check status if we're already redirecting or don't have a user/session
    if (!user || !session?.access_token || isLoading || redirecting || checkingStatus) {
      return;
    }

    // Only check status when needed (when we have a user but haven't redirected)
    const handleAuthenticatedUser = async () => {
      try {
        setRedirecting(true);
        setCheckingStatus(true);

        // Check user approval status using the throttled function
        debugLog('Login page checking approval status');
        const status = await checkApprovalStatus();

        debugLog('Login page: User status is', status);

        if (status === 'approved') {
          debugLog('User is approved, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else if (status === 'pending') {
          toast("Your account is pending approval", {
            description: "An administrator will review your request soon."
          });
          navigate('/pending', { replace: true });
        } else if (status === 'rejected') {
          toast.error("Access denied", {
            description: "Your access request was not approved."
          });
          navigate('/', { replace: true });
        } else if (status === 'unknown') {
          // If status is unknown, try to create a profile
          debugLog('Status unknown, redirecting to pending page after creating profile');
          navigate('/pending', { replace: true });
        } else {
          // If status is unknown due to errors, don't get stuck in a redirect loop
          debugLog('Status unknown, waiting before retry');
          // Allow one more attempt after a delay
          setTimeout(() => {
            setRedirecting(false);
            setCheckingStatus(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking user approval status:', error);
        toast.error("Unable to check access status");
        // Release flags to allow one more attempt
        setTimeout(() => {
          setRedirecting(false);
          setCheckingStatus(false);
        }, 5000);
      }
    };

    handleAuthenticatedUser();
  }, [user, session, isLoading, redirecting, checkingStatus, navigate, from, checkApprovalStatus]);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  // Only show loading state while checking authentication
  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {redirecting ? "Preparing your dashboard..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show a message while redirecting
  if (user && session?.access_token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Already authenticated, redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'Sign up to create and manage your surveys'
              : 'Sign in to create and manage your surveys'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmailAuthForm onToggleMode={toggleAuthMode} isSignUp={isSignUp} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button variant="outline" className="w-full" disabled>
                    Continue with Google
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>On the roadmap</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 justify-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
