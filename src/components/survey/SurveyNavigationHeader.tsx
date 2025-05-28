
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, FileText, Check, RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSurveyData } from '@/hooks/useSurveyData';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface ActiveUser {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  last_active: Date;
}

interface SurveyNavigationHeaderProps {
  activeUsers: ActiveUser[];
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function SurveyNavigationHeader({ activeUsers, isSaving, lastSaved }: SurveyNavigationHeaderProps) {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const { surveyData } = useSurveyData();
  const { user: currentUser } = useAuth();
  const { collapsed } = useSidebar();

  // Check if user is online
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debug logging
  console.log("[DEBUG] SurveyNavigationHeader - activeUsers prop:", activeUsers);
  console.log("[DEBUG] SurveyNavigationHeader - currentUser:", currentUser);
  console.log("[DEBUG] SurveyNavigationHeader - surveyId:", surveyId);

  const getCurrentSurveyContext = () => {
    if (!surveyId || !surveyData) return null;

    const unorganized = surveyData.unorganizedSurveys.find(s => s.id === surveyId);
    if (unorganized) return { name: unorganized.name };

    for (const folder of surveyData.folders) {
      const survey = folder.surveys.find(s => s.id === surveyId);
      if (survey) {
        return {
          name: survey.name,
          folder: folder.name,
        };
      }
    }

    return null;
  };

  const current = getCurrentSurveyContext();

  // Show current user if no active users are available but we have a current user
  const displayUsers = activeUsers.length > 0 ? activeUsers : (currentUser ? [{
    id: currentUser.id,
    name: currentUser.user_metadata?.full_name || currentUser.email,
    email: currentUser.email,
    avatar_url: currentUser.user_metadata?.avatar_url,
    last_active: new Date(),
  }] : []);

  console.log("[DEBUG] SurveyNavigationHeader - displayUsers:", displayUsers);
  console.log("[DEBUG] SurveyNavigationHeader - will render", displayUsers.length, "users");

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'Saved just now';
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `Saved ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `Saved on ${date.toLocaleDateString()}`;
    }
  };

  const getSaveStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (isSaving) {
      return <RotateCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
    
    if (lastSaved) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const getSaveStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    
    if (isSaving) {
      return 'Saving...';
    }
    
    return formatLastSaved(lastSaved);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background px-4 flex items-center justify-between">
      {/* Left: Navigation path */}
      <div className="flex items-center gap-4">
        <div style={{ width: "230px" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 justify-start"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </div>
        {current && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {current.folder && (
                <>
                  <span>{current.folder}</span>
                  <span className="mx-1">/</span>
                </>
              )}
              <FileText className="h-4 w-4" />
              <span className="truncate">{current.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Save status and Active user avatars */}
      <TooltipProvider>
        <div className="flex items-center gap-4 pr-2 z-50 relative">
          {/* Save Status Indicator */}
          {surveyId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {getSaveStatusIcon()}
                  <span className="text-sm text-muted-foreground">
                    {getSaveStatusText()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getSaveStatusText()}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Active Users */}
          <div className="flex items-center gap-2">
            {displayUsers.length > 0 ? (
              displayUsers
                .sort((a, b) => b.last_active.getTime() - a.last_active.getTime())
                .slice(0, 4)
                .map(user => {
                  console.log("[DEBUG] Rendering user:", user);
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
                })
            ) : (
              <div className="text-sm text-muted-foreground">No active users</div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
}
