
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { signInWithGoogle, user, isLoading, session, refreshSession } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug current URL and search parameters
  useEffect(() => {
    console.log('Login page loaded at:', window.location.href);
    console.log('URL search params:', window.location.search);
    console.log('URL hash:', window.location.hash);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      console.log(`URL param: ${key} = ${value}`);
    }

    // Log hash parameters if present (often used for tokens)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      for (const [key, value] of hashParams.entries()) {
        console.log(`Hash param: ${key} = ${value.substring(0, 10)}...`);
      }
    }

    // Check local storage for session data
    try {
      const hasLocalStorage = !!window.localStorage;
      console.log('LocalStorage available:', hasLocalStorage);
      
      if (hasLocalStorage) {
        const supabaseSession = localStorage.getItem('sb-gtzcjxzllsrtaieopsgc-auth-token');
        console.log('Supabase session in storage:', !!supabaseSession);
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  }, [location]);

  // Attempt session recovery once on login page load
  useEffect(() => {
    const attemptRecovery = async () => {
      if (!recoveryAttempted && !user && !isLoading) {
        console.log('Login - Attempting session recovery');
        try {
          const recovered = await refreshSession();
          console.log('Login - Session recovery result:', recovered);
          setRecoveryAttempted(true);
        } catch (error) {
          console.error('Login - Session recovery failed:', error);
          setRecoveryAttempted(true);
        }
      }
    };

    attemptRecovery();
  }, [refreshSession, user, isLoading, recoveryAttempted]);
  
  // Get the path to redirect to after login
  const from = location.state?.from || '/';
  
  // If already logged in, redirect
  useEffect(() => {
    if (user && session?.access_token && !isLoading) {
      console.log('User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, session, isLoading, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      console.log('Initiating Google login...');
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

  // Only show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to create and manage your surveys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
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
            {isAuthenticating ? "Signing in..." : "Sign in with Google"}
          </Button>
          
          <div className="relative flex items-center justify-center mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative bg-background px-4 text-xs uppercase text-muted-foreground">
              Secure Authentication
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 justify-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
