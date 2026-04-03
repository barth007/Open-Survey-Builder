
import React, { createContext, useContext } from 'react';
import { useAuthState } from './useAuthState';
import { AuthContextType, ApprovalStatus, Session, User } from './types';
import { 
  checkApprovalStatus, 
  refreshSession, 
  signInWithGoogle, 
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signOut as authSignOut 
} from './authService';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  approvalStatus: 'unknown',
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
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

  const syncAuthStateFromStorage = () => {
    const token = localStorage.getItem('sb_auth_token');
    const userJson = localStorage.getItem('sb_user');

    if (!token || !userJson) {
      setUser(null);
      setSession(null);
      setApprovalStatus('unknown');
      return null;
    }

    try {
      const nextUser = JSON.parse(userJson) as User;
      const nextSession: Session = {
        access_token: token,
        token_type: 'bearer',
        user: nextUser,
      };
      setUser(nextUser);
      setSession(nextSession);
      setApprovalStatus((nextUser.status as ApprovalStatus) || 'unknown');
      return { user: nextUser, session: nextSession };
    } catch (error) {
      console.error('Failed to sync auth state from storage:', error);
      localStorage.removeItem('sb_auth_token');
      localStorage.removeItem('sb_user');
      setUser(null);
      setSession(null);
      setApprovalStatus('unknown');
      return null;
    }
  };

  // Wrapper for checking approval status
  const handleCheckApprovalStatus = async (): Promise<ApprovalStatus> => {
    const status = await checkApprovalStatus(
      user?.id, 
      statusCacheRef, 
      checkingStatusRef, 
      setApprovalStatus
    );
    syncAuthStateFromStorage();
    return status;
  };

  // Wrapper for refresh session
  const handleRefreshSession = async (): Promise<boolean> => {
    const result = await refreshSession();
    syncAuthStateFromStorage();
    return result;
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    syncAuthStateFromStorage();
    return result;
  };

  const handleSignUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const result = await signUpWithEmail(email, password, fullName);
    syncAuthStateFromStorage();
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
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    resetPassword,
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
