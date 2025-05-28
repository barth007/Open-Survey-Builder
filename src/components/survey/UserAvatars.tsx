
import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface ActiveUser {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  last_active: Date;
}

interface UserAvatarsProps {
  activeUsers: ActiveUser[];
}

export const UserAvatars: React.FC<UserAvatarsProps> = ({ activeUsers }) => {
  const { user: currentUser } = useAuth();

  // Show current user if no active users are available but we have a current user
  const displayUsers = activeUsers.length > 0 ? activeUsers : (currentUser ? [{
    id: currentUser.id,
    name: currentUser.user_metadata?.full_name || currentUser.email,
    email: currentUser.email,
    avatar_url: currentUser.user_metadata?.avatar_url,
    last_active: new Date(),
  }] : []);

  if (displayUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <div className="flex items-center gap-2 bg-white rounded-full shadow-lg p-2 border">
          {displayUsers
            .sort((a, b) => b.last_active.getTime() - a.last_active.getTime())
            .slice(0, 4)
            .map(user => {
              const isYou = user.id === currentUser?.id;
              return (
                <Tooltip key={user.id}>
                  <TooltipTrigger asChild>
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.email || "User"}
                        className={cn(
                          "w-8 h-8 rounded-full border bg-white",
                          isYou && "ring-2 ring-primary"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full border bg-muted text-xs flex items-center justify-center font-medium",
                          isYou && "ring-2 ring-primary"
                        )}
                      >
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name || user.email}{isYou ? " (you)" : ""}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
        </div>
      </TooltipProvider>
    </div>
  );
};
