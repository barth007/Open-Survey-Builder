
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isDevelopment } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user && !isDevelopment()) {
      console.log('ProtectedRoute - Authentication required for path:', location.pathname);
      toast("Authentication Required", {
        description: "Please sign in to access this page"
      });
    }
  }, [user, isLoading, location.pathname, isDevelopment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
          <p className="text-sm text-muted-foreground">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Always allow access in development mode, or if the user is authenticated
  if (isDevelopment() || user) {
    return <>{children}</>;
  }

  console.log('ProtectedRoute - Redirecting to login from:', location.pathname);
  return (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
};

export default ProtectedRoute;
