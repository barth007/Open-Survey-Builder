
import { Session, User } from '@supabase/supabase-js';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'checking' | 'unknown';

export interface StatusCache {
  status: ApprovalStatus;
  timestamp: number;
  attemptCount: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  approvalStatus: ApprovalStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkApprovalStatus: () => Promise<ApprovalStatus>;
}
