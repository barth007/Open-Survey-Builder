
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';

const Landing = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Check user status when they're logged in
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Check if user has a profile and what their status is
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('status, role')
            .eq('id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            toast.error('Unable to check access status');
            return;
          }

          console.log('Profile status check result:', profile);

          if (profile) {
            // Use standardized 'approved' status
            if (profile.status === 'approved') {
              // User is approved, redirect to dashboard
              navigate('/dashboard');
            } else if (profile.status === 'pending') {
              // User is pending, redirect to pending page
              navigate('/pending', { replace: true });
            } else if (profile.status === 'rejected') {
              // User was rejected
              toast.error('Your access request was denied');
              signOut();
            }
          } else {
            // No profile found, create one with pending status
            await createPendingProfile();
          }
        } catch (error) {
          console.error('Error in status check:', error);
          toast.error('There was an error checking your status');
          
          // If it might be a missing profile issue, try to create one
          try {
            await createPendingProfile();
          } catch (createError) {
            console.error('Error creating profile after status check failed:', createError);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsPending(false);
      }
    };

    checkUserStatus();
  }, [user, navigate, signOut]);

  // Create a pending profile for a new user
  const createPendingProfile = async () => {
    if (!user) return;

    try {
      console.log('Creating pending profile for new user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          status: 'pending', // Use standardized 'pending' status
          role: 'user', // Default role for new users
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error creating profile:', error);
        toast.error('Unable to submit your access request');
        return;
      }

      console.log('Profile created successfully:', data);
      setIsPending(true);
      toast.success('Access request submitted successfully');
      navigate('/pending', { replace: true });
    } catch (error) {
      console.error('Exception during profile creation:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle Google sign-in button click
  const handleRequestAccess = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // The rest will be handled by the useEffect
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('There was a problem with Google sign-in');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                    No fuss. Just research.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A survey tool built by a senior user researcher — for researchers and anyone who needs answers.
                  </p>
                </div>
              </div>
              <div className="mx-auto w-full max-w-md space-y-6 lg:max-w-lg">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Request Access</h2>
                  <p className="text-muted-foreground">
                    Sign in with Google to request access to the platform.
                  </p>
                </div>
                
                {isPending ? (
                  <div className="rounded-lg border bg-card p-8 text-center space-y-4">
                    <h3 className="text-xl font-semibold">Thank you!</h3>
                    <p>Your access request is pending approval.</p>
                    <p className="text-sm text-muted-foreground">We'll notify you when your access is approved.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleRequestAccess}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="animate-spin">⏳</span>
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
                      {isLoading ? "Processing..." : "Request Access with Google"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
