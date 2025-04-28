import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';


interface UserProfileProps {
  compact?: boolean;
}

const UserProfile = ({ compact = false }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = () => {
    const displayName = profile?.full_name || user.user_metadata?.full_name;
    if (displayName) {
      return displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (loading && !compact) {
    return (
      <div className="w-full flex items-center justify-center p-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <Avatar className="h-8 w-8 border-2 border-background">
        <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div 
      className="w-full flex items-center gap-3 p-3 cursor-pointer hover:bg-sidebar-accent transition-colors"
      onClick={handleProfileClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium truncate">
          {profile?.full_name || user.user_metadata?.full_name || user.email}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserProfile;
