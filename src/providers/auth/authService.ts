import { debugLog, debugWarn } from '@/lib/logger';
import { ApprovalStatus, StatusCache } from './types';
import { toast } from '@/components/ui/sonner';
import { apiFetch } from '@/lib/api';
import { resolveApiUrl } from '@/lib/api-url';

const AUTH_TOKEN_STORAGE_KEY = 'sb_auth_token';
const AUTH_USER_STORAGE_KEY = 'sb_user';

// Max retries for failed status checks
const MAX_STATUS_CHECK_RETRIES = 3;
  
// Minimum time between status checks (5 seconds)
const MIN_STATUS_CHECK_INTERVAL = 5000;

type BackendProfile = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string | null;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  role?: 'user' | 'admin' | string;
  status?: ApprovalStatus | string;
  updatedAt?: string | null;
};

type BackendLoginResponse = {
  token: string;
  user: BackendProfile;
};

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

const normalizeApprovalStatus = (value: unknown): ApprovalStatus => {
  if (value === 'approved' || value === 'pending' || value === 'rejected' || value === 'checking') {
    return value;
  }

  return 'unknown';
};

const normalizeUser = (input: Partial<BackendProfile> & { id: string }) => {
  const name = typeof input.name === 'string' ? input.name : null;
  const avatarUrl = typeof input.avatarUrl === 'string' ? input.avatarUrl : null;
  const status = normalizeApprovalStatus(input.status);

  return {
    id: input.id,
    email: typeof input.email === 'string' ? input.email : null,
    name,
    role: input.role || 'user',
    status,
    avatarUrl: avatarUrl ? resolveApiUrl(avatarUrl) : null,
    emailNotifications: Boolean(input.emailNotifications),
    marketingEmails: Boolean(input.marketingEmails),
    updatedAt: input.updatedAt || null,
    user_metadata: {
      full_name: name,
      name,
      avatar_url: avatarUrl ? resolveApiUrl(avatarUrl) : null,
    },
  };
};

const storeAuth = (token: string, user: ReturnType<typeof normalizeUser>) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

const fetchCurrentProfile = async () => {
  const profile = await apiFetch('/auth/profile') as BackendProfile;
  return normalizeUser(profile);
};

export async function checkApprovalStatus(
  userId: string | undefined,
  statusCacheRef: React.MutableRefObject<StatusCache>,
  checkingStatusRef: React.MutableRefObject<boolean>,
  setApprovalStatus: (status: ApprovalStatus) => void
): Promise<ApprovalStatus> {
  // If no user, return unknown immediately
  if (!userId) return 'unknown';
  
  // Check if a request is already in progress
  if (checkingStatusRef.current) {
    debugLog('Status check already in progress, using cached value:', statusCacheRef.current.status);
    return statusCacheRef.current.status;
  }
  
  // Calculate time since last check
  const now = Date.now();
  const timeSinceLastCheck = now - statusCacheRef.current.timestamp;
  
  // If we checked recently and have a valid status, return cached value
  if (timeSinceLastCheck < MIN_STATUS_CHECK_INTERVAL && statusCacheRef.current.status !== 'unknown') {
    debugLog('Using cached status check:', statusCacheRef.current.status, 
      'Age:', Math.round(timeSinceLastCheck/1000), 'seconds');
    return statusCacheRef.current.status;
  }
  
  // Check if we've hit max retries for failed requests
  if (statusCacheRef.current.attemptCount >= MAX_STATUS_CHECK_RETRIES && 
      statusCacheRef.current.status === 'unknown') {
    debugLog('Max retries reached for status check, circuit broken');
    // Reset attempt count after a cooling period (30 seconds)
    if (timeSinceLastCheck > 30000) {
      statusCacheRef.current.attemptCount = 0;
    } else {
      return 'unknown';
    }
  }
  
  try {
    // Mark that we're checking
    checkingStatusRef.current = true;
    setApprovalStatus('checking');
    
    debugLog('Checking profile status for user:', userId, 
      'Attempt:', statusCacheRef.current.attemptCount + 1);

    const profile = await fetchCurrentProfile();
    const status = normalizeApprovalStatus(profile.status);

    if (profile.id !== userId) {
      throw new Error('Authenticated profile does not match the requested user');
    }

    if (localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(profile));
    }

    statusCacheRef.current = {
      status,
      timestamp: now,
      attemptCount: 0
    };
    setApprovalStatus(status);
    return status;
  } catch (err) {
    console.error('Error in checkApprovalStatus:', err);
    // Update cache with error attempt
    statusCacheRef.current.attemptCount += 1;
    statusCacheRef.current.timestamp = now;
    setApprovalStatus('unknown');
    return 'unknown';
  } finally {
    // Release the lock
    checkingStatusRef.current = false;
  }
}

export async function refreshSession() {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) {
    return false;
  }

  try {
    debugLog('Refreshing local auth state against backend profile');
    const profile = await fetchCurrentProfile();
    storeAuth(token, profile);
    return true;
  } catch (error) {
    console.error('Exception during session refresh:', error);
    clearStoredAuth();
    return false;
  }
}

export async function signInWithGoogle() {
  const message = 'Google sign-in is not available in the current backend';
  toast.error(message);
  throw new Error(message);
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }) as BackendLoginResponse;

    const user = normalizeUser(data.user);
    storeAuth(data.token, user);

    debugLog('Email sign-in successful:', { userId: user.id });
    return {
      user,
      session: {
        access_token: data.token,
        token_type: 'bearer',
        user,
      },
    };
  } catch (error) {
    console.error('Error signing in with email:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to sign in. Please check your credentials.');
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name: fullName || undefined,
      }),
    });

    toast.success('Account created', {
      description: 'Your account is pending approval before you can sign in.',
    });

    return data;
  } catch (error) {
    console.error('Error signing up with email:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    throw error;
  }
}

export async function resetPassword(email: string) {
  debugWarn('Password reset requested without a self-service backend flow', email);
  toast.info('Password reset is not available yet. Contact an administrator.');
}

export async function signOut() {
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.startsWith('sb_') || key.startsWith('sb-'))) {
      debugLog('Clearing localStorage key before signout:', key);
      localStorage.removeItem(key);
    }
  }

  debugLog('Sign out completed successfully');
}
