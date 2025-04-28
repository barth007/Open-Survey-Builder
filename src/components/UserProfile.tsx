
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  compact?: boolean;
}

const UserProfile = ({ compact = false }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  // Function to get initials from name or email
  const getInitials = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
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

  if (compact) {
    return (
      <Avatar className="border-2 border-background h-8 w-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="p-4 mt-auto border-t">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
