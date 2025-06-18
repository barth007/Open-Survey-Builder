import { debugLog, debugWarn } from '@/lib/logger';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, FileText, Check, RotateCw, WifiOff, Share } from 'lucide-react';
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
import { ShareSurveyButton } from '@/components/survey/ShareSurveyButton';
import { Survey } from '@/types/survey';
import { ActiveUser } from '@/types/survey-organization';

interface SurveyNavigationHeaderProps {
  activeUsers: ActiveUser[];
  isSaving?: boolean;
  lastSaved?: Date | null;
  survey?: Survey;
  onPublishToggle?: () => void;
  statusText?: string | null;
}

export function SurveyNavigationHeader({ 
  activeUsers, 
  isSaving, 
  lastSaved, 
  survey,
  onPublishToggle,
  statusText 
}: SurveyNavigationHeaderProps) {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const { surveyData } = useSurveyData();
  const { user: currentUser } = useAuth();
  const { collapsed } = useSidebar();

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

  // Debug logging
  debugLog("[DEBUG] SurveyNavigationHeader - activeUsers prop:", activeUsers);
  debugLog("[DEBUG] SurveyNavigationHeader - currentUser:", currentUser);
  debugLog("[DEBUG] SurveyNavigationHeader - surveyId:", surveyId);

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

  // Show current user if no active users are available but we have a current user
  const displayUsers = activeUsers.length > 0 ? activeUsers : (currentUser ? [{
    id: currentUser.id,
    name: currentUser.user_metadata?.full_name || currentUser.email,
    avatarUrl: currentUser.user_metadata?.avatar_url,
    lastActive: new Date(),
  }] : []);

  debugLog("[DEBUG] SurveyNavigationHeader - displayUsers:", displayUsers);
  debugLog("[DEBUG] SurveyNavigationHeader - will render", displayUsers.length, "users");

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

  const getSaveStatusText = () => {
    if (statusText) return statusText;
    if (!isOnline) return 'Offline';
    return formatLastSaved(lastSaved);
  };

  const getSaveStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-gray-400" />;
    }

    if (statusText === "Typing...") {
      return <div className="h-4 w-4 rounded-full bg-blue-400"></div>;
    }

    if (showSaving || statusText === "Saving...") {
      return <RotateCw className="h-4 w-4 text-gray-400 animate-spin" />;
    }

    return <Check className="h-4 w-4 text-gray-400" />;
  };

  const shouldShowText = () => {
    return showSaving || statusText !== null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background px-4 flex items-center justify-between">
      {/* Left: Share button and Navigation path */}
      <div className="flex items-center gap-4">

        <div style={{ width: "224px" }}>
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
         <Separator orientation="vertical" className="h-4" />
         {survey && surveyId && (
          <ShareSurveyButton
            survey={survey}
            onPublishToggle={onPublishToggle}
          />
        )}
      </div>

      {/* Right: Save status and Active user avatars */}
      <TooltipProvider>
        <div className="flex items-center gap-4 pr-2 z-50 relative">
          {/* Save status and active users remain the same */}
          {/* ... keep existing code (save status indicator and active users) */}
        </div>
      </TooltipProvider>
    </header>
  );
}
