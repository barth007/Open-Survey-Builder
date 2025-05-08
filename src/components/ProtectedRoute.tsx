import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, session, refreshSession } = useAuth();
  const location = useLocation();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

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

  // Check if the user is approved to access the application
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (user && !isLoading && !isRecovering) {
        setIsCheckingStatus(true);
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error checking profile status:', error);
            setIsApproved(false);
            return;
          }
          
          setIsApproved(data?.status === 'approved');
          
          if (data?.status !== 'approved') {
            toast.error("Access Denied", {
              description: "Your account has not been approved yet"
            });
          }
        } catch (err) {
          console.error('Error checking approval status:', err);
          setIsApproved(false);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };
    
    checkApprovalStatus();
  }, [user, isLoading, isRecovering]);

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

  // Check that both user and valid session exist and user is approved
  if (user && session?.access_token && isApproved) {
    console.log('ProtectedRoute - Access granted for:', location.pathname);
    return <>{children}</>;
  }

  // If user is authenticated but not approved, redirect to landing
  if (user && session?.access_token && !isApproved) {
    console.log('ProtectedRoute - User not approved, redirecting to landing');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - Redirecting to login from:', location.pathname, 
    'Auth state:', { user: !!user, session: !!session, recoveryAttempted, isApproved });
    
  return (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
};

export default ProtectedRoute;
