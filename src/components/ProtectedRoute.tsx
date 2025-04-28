
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // For debugging authentication issues
  useEffect(() => {
    if (!isLoading) {
      console.log('ProtectedRoute - Auth state:', { 
        isAuthenticated: !!user,
        currentPath: location.pathname,
      });
    }
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (!user) {
    // Add the current location to use as a return URL after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
