
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('ProtectedRoute - Authentication required for path:', location.pathname);
      toast("Authentication Required", {
        description: "Please sign in to access this page"
      });
    }
  }, [user, isLoading, location.pathname]);

  // Enhanced authentication check to ensure both user and session exist
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Check that both user and valid session exist
  if (user && session?.access_token) {
    return <>{children}</>;
  }

  console.log('ProtectedRoute - Redirecting to login from:', location.pathname, 
    'Auth state:', { user: !!user, session: !!session });
    
  return (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
};

export default ProtectedRoute;
