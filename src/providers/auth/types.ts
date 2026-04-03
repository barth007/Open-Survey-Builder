export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'checking' | 'unknown';

export interface UserMetadata {
  full_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
}

export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  role?: 'user' | 'admin' | string;
  status?: ApprovalStatus | string;
  avatarUrl?: string | null;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  updatedAt?: string | null;
  user_metadata?: UserMetadata;
}

export interface Session {
  access_token: string;
  token_type?: string;
  expires_at?: number | null;
  user: User;
}

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
