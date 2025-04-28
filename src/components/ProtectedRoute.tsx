
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading) {
      console.log('ProtectedRoute - Auth state:', { 
        isAuthenticated: !!user,
        userEmail: user?.email,
        currentPath: location.pathname + location.search,
      });
      
      if (!user) {
        toast("Authentication Required", {
          description: "Please sign in to access this page"
        });
      }
    }
  }, [user, isLoading, location.pathname, location.search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to login from:', location.pathname);
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
