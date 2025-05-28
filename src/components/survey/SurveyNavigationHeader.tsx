
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
import { ShareSurveyButton } from '@/components/survey/ShareSurveyButton';
import { UserAvatars } from '@/components/survey/UserAvatars';
import { Survey } from '@/types/survey';

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
  survey?: Survey;
  onPublishToggle?: () => void;
}

export function SurveyNavigationHeader({ 
  activeUsers, 
  isSaving, 
  lastSaved, 
  survey,
  onPublishToggle 
}: SurveyNavigationHeaderProps) {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const { surveyData } = useSurveyData();
  const { user: currentUser } = useAuth();

  // Check if user is online
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // State for showing saving status with minimum duration
  const [showSaving, setShowSaving] = React.useState(false);
  const savingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

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

  // Handle saving state with minimum 1-second display
  React.useEffect(() => {
    if (isSaving) {
      setShowSaving(true);
      // Clear any existing timeout
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
    } else if (showSaving) {
      // When saving stops, wait at least 1 second before hiding
      savingTimeoutRef.current = setTimeout(() => {
        setShowSaving(false);
      }, 1000);
    }

    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
    };
  }, [isSaving, showSaving]);

  const getCurrentSurveyContext = () => {
    if (!surveyId || !surveyData) return null;

    const unorganized = surveyData.unorganizedSurveys.find(s => s.id === surveyId);
    if (unorganized) return { name: unorganized.name, survey: unorganized };

    for (const folder of surveyData.folders) {
      const folderSurvey = folder.surveys.find(s => s.id === surveyId);
      if (folderSurvey) {
        return {
          name: folderSurvey.name,
          folder: folder.name,
          survey: folderSurvey,
        };
      }
    }

    return null;
  };

  const current = getCurrentSurveyContext();

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
      return <WifiOff className="h-4 w-4 text-gray-400" />;
    }

    if (showSaving) {
      return <RotateCw className="h-4 w-4 text-gray-400 animate-spin" />;
    }

    // Default to saved status when online and not saving
    return <Check className="h-4 w-4 text-gray-400" />;
  };

  const getSaveStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }

    if (showSaving) {
      return 'Saving...';
    }

    return formatLastSaved(lastSaved);
  };

  const shouldShowText = () => {
    return showSaving; // Only show text when saving
  };

  // Convert activeUsers to match UserAvatars interface
  const convertedActiveUsers: ActiveUser[] = activeUsers.map(user => ({
    ...user,
    last_active: user.last_active || new Date()
  }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background px-4 flex items-center justify-between">
      {/* Left: Share button and Navigation path */}
      <div className="flex items-center gap-4">
        {/* Share Survey Button - only show when in a survey and we have the full survey data */}
        {survey && surveyId && (
          <ShareSurveyButton
            survey={survey}
            onPublishToggle={onPublishToggle}
          />
        )}

        <div style={{ width: "200px" }}>
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

      {/* Right: Save status and User Avatars */}
      <TooltipProvider>
        <div className="flex items-center gap-4 pr-2 z-50 relative">
          {/* Save Status Indicator */}
          {surveyId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {getSaveStatusIcon()}
                  {shouldShowText() && (
                    <span className="text-sm text-muted-foreground">
                      {getSaveStatusText()}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getSaveStatusText()}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* User Avatars */}
          {surveyId && <UserAvatars activeUsers={convertedActiveUsers} />}
        </div>
      </TooltipProvider>
    </header>
  );
}
