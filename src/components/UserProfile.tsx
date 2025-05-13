
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UserProfileProps {
  compact?: boolean;
}

const UserProfile = ({ compact = false }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  console.log('UserProfile rendering:', { user: user?.id, profileId: profile?.id, loading, compact });

  if (!user) return null;

  const getInitials = () => {
    const displayName = profile?.full_name;
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
      toast("You have been signed out of your account");
      navigate('/login');
    } catch (error) {
      toast("There was a problem signing out. Please try again.");
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

  // Use avatar from profile
  const avatarUrl = profile?.avatar_url;
  const isAdmin = profile?.role === 'admin';

  if (compact) {
    return (
      <div className="w-full flex justify-center p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin')} className="flex items-center gap-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="w-full p-3 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-start gap-3 px-2 hover:bg-muted">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || user.email?.split('@')[0] || user.email}
                </p>
                {isAdmin && <Badge variant="success" className="text-xs">Admin</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || user.email}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin')} className="flex items-center gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
