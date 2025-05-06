import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, session, refreshSession } = useAuth();
  const location = useLocation();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  useEffect(() => {
    const checkAndRecoverSession = async () => {
      // Only attempt recovery if we're not loading and don't have a valid session
      if (!isLoading && (!user || !session?.access_token) && !recoveryAttempted) {
        console.log('ProtectedRoute - Attempting session recovery');
        setIsRecovering(true);
        
        try {
          const recovered = await refreshSession();
          console.log('Session recovery result:', recovered);
          
          if (!recovered) {
            console.log('Session recovery failed, will redirect to login');
            toast.error("Authentication Required", {
              description: "Please sign in to access this page"
            });
          }
        } catch (error) {
          console.error('Session recovery failed:', error);
        } finally {
          setIsRecovering(false);
          setRecoveryAttempted(true);
        }
      }
    };
    
    checkAndRecoverSession();
  }, [user, session, isLoading, recoveryAttempted, refreshSession]);

  // Attempt deep validation if we have a session but keep failing RLS policies
  useEffect(() => {
    // If we have both a user and session, but still hit RLS issues,
    // a periodic refresh of the session can help
    if (user && session && !isLoading && !isRecovering) {
      const periodicRefresh = setInterval(async () => {
        try {
          await refreshSession();
          console.log('Regular session refresh completed in ProtectedRoute');
        } catch (e) {
          console.error('Regular session refresh failed:', e);
        }
      }, 60000); // Refresh every minute
      
      return () => clearInterval(periodicRefresh);
    }
  }, [user, session, isLoading, isRecovering, refreshSession]);

  // Show loading state while checking or recovering session
  if (isLoading || isRecovering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isRecovering ? "Recovering your session..." : "Verifying your session..."}
          </p>
        </div>
      </div>
    );
  }

  // Check that both user and valid session exist
  if (user && session?.access_token) {
    console.log('ProtectedRoute - Session verified for:', location.pathname);
    return <>{children}</>;
  }

  console.log('ProtectedRoute - Redirecting to login from:', location.pathname, 
    'Auth state:', { user: !!user, session: !!session, recoveryAttempted });
    
  return (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
};

export default ProtectedRoute;
