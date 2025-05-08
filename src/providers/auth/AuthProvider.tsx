
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from './useAuthState';
import { AuthContextType, ApprovalStatus } from './types';
import { checkApprovalStatus, refreshSession, signInWithGoogle, signOut as authSignOut } from './authService';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  approvalStatus: 'unknown',
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshSession: async () => false,
  checkApprovalStatus: async () => 'unknown',
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    approvalStatus,
    setApprovalStatus,
    statusCacheRef,
    checkingStatusRef
  } = useAuthState();

  // Wrapper for checking approval status
  const handleCheckApprovalStatus = async (): Promise<ApprovalStatus> => {
    return await checkApprovalStatus(
      user?.id, 
      statusCacheRef, 
      checkingStatusRef, 
      setApprovalStatus
    );
  };

  // Wrapper for refresh session
  const handleRefreshSession = async (): Promise<boolean> => {
    const result = await refreshSession();
    return result;
  };

  // Wrapper for sign out
  const handleSignOut = async (): Promise<void> => {
    await authSignOut();
    setUser(null);
    setSession(null);
    setApprovalStatus('unknown');
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    approvalStatus,
    signInWithGoogle,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,
    checkApprovalStatus: handleCheckApprovalStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
