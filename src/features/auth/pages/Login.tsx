import { debugLog, debugWarn } from '@/lib/logger';

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EmailAuthForm from '@/components/auth/EmailAuthForm';

const Login = () => {
  const { signInWithGoogle, user, isLoading, session, refreshSession, approvalStatus, checkApprovalStatus } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
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

  // Clear any stale RLS errors on login page visit
  useEffect(() => {
    const clearSessionErrors = async () => {
      // Only attempt refresh if not already attempted and we have a session
      const currentSession = await supabase.auth.getSession();
      
      // If we're on the login page but have a session token that might be invalid,
      // let's try to refresh it once
      if (currentSession.data?.session && !recoveryAttempted) {
        debugLog('Found existing session on login page, attempting refresh');
        try {
          await refreshSession();
          setRecoveryAttempted(true);
        } catch (e) {
          console.error('Failed to refresh session on login page:', e);
        }
      }
    };
    
    clearSessionErrors();
  }, [refreshSession, recoveryAttempted]);

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

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      debugLog('Initiating Google login...');
      toast("Authentication", {
        description: "Starting Google authentication flow"
      });
      await signInWithGoogle();
      // Redirect will happen automatically after successful auth
    } catch (error) {
      console.error('Login handler error:', error);
      toast("Login Failed", {
        description: "There was a problem signing in with Google."
      });
    } finally {
      // Keep button disabled until redirect happens
      setTimeout(() => {
        setIsAuthenticating(false);
      }, 3000);
    }
  };

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
          
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative bg-background px-4 text-xs uppercase text-muted-foreground">
              Or continue with
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isAuthenticating ? "Signing in..." : "Continue with Google"}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 justify-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
