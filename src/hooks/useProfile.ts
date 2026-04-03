import { debugLog } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import { resolveApiUrl } from '@/lib/api-url';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  updated_at: string | null;
  email_notifications?: boolean;
  marketing_emails?: boolean;
};

type BackendProfile = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  updatedAt: string | null;
};

const mapProfileFromApi = (profile: BackendProfile): Profile => ({
  id: profile.id,
  full_name: profile.name,
  avatar_url: profile.avatarUrl ? resolveApiUrl(profile.avatarUrl) : null,
  email: profile.email,
  status: profile.status,
  role: profile.role,
  updated_at: profile.updatedAt,
  email_notifications: profile.emailNotifications ?? false,
  marketing_emails: profile.marketingEmails ?? false,
});

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        debugLog('Fetching profile for user:', user.id);
        const data = await apiFetch('/auth/profile') as BackendProfile;

        if (!isMounted) {
          return;
        }

        const nextProfile = mapProfileFromApi(data);
        setProfile(nextProfile);
        setError(null);
      } catch (fetchError) {
        console.error('Error loading profile:', fetchError);
        if (isMounted) {
          setError(fetchError as Error);
          toast("Couldn't load your profile information. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return false;
    }

    try {
      const payload = {
        ...(Object.prototype.hasOwnProperty.call(updates, 'full_name') ? { name: updates.full_name ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'avatar_url') ? { avatarUrl: updates.avatar_url ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'email_notifications')
          ? { emailNotifications: updates.email_notifications }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'marketing_emails')
          ? { marketingEmails: updates.marketing_emails }
          : {}),
      };

      debugLog('Updating profile with payload:', payload);
      const updatedProfile = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as BackendProfile;

      setProfile(mapProfileFromApi(updatedProfile));
      toast('Your profile has been updated successfully');
      return true;
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      toast('There was a problem updating your profile');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
