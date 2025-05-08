import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, session, refreshSession, approvalStatus, checkApprovalStatus } = useAuth();
  const location = useLocation();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Handle session recovery
  useEffect(() => {
    const checkAndRecoverSession = async () => {
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

  // Check user approval status
  useEffect(() => {
    const verifyUserAccess = async () => {
      if (user && !isLoading && !isRecovering) {
        setIsCheckingStatus(true);
        
        try {
          // Use the centralized approval status check from AuthProvider
          await checkApprovalStatus();
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };
    
    verifyUserAccess();
  }, [user, isLoading, isRecovering, checkApprovalStatus]);

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
  if (isLoading || isRecovering || isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isRecovering ? "Recovering your session..." : 
             isCheckingStatus ? "Verifying your access..." :
             "Verifying your session..."}
          </p>
        </div>
      </div>
    );
  }

  // Check that both user and valid session exist
  if (!user || !session?.access_token) {
    console.log('ProtectedRoute - Redirecting to login from:', location.pathname, 
      'Auth state:', { user: !!user, session: !!session, recoveryAttempted });
      
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Check if user has approval status
  if (approvalStatus === 'approved') {
    console.log('ProtectedRoute - Access granted for:', location.pathname);
    return <>{children}</>;
  } else if (approvalStatus === 'pending') {
    console.log('ProtectedRoute - User not approved, redirecting to pending');
    return <Navigate to="/pending" replace />;
  } else {
    // Wait for approval status if it's still being determined
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }
};

export default ProtectedRoute;
