import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSurveyData } from '@/hooks/useSurveyData';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import UserProfile from '@/components/UserProfile';

export function SurveyNavigationHeader() {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const { surveyData } = useSurveyData();
  const { activeUsers } = useActiveUsers(surveyId || '');
  console.log("[DEBUG] surveyId:", surveyId);

  console.log("[DEBUG] activeUsers in nav:", activeUsers);

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

  return (
    <header className="w-full h-14 border-b bg-background px-4 flex items-center justify-between">
      {/* Left: Navigation path */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Button>

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

      {/* Right: Active user avatars */}
      <div className="flex items-center gap-2 pr-2 z-50 relative bg-red-100">
      <p className="text-xs text-green-500">Avatars expected: {activeUsers.length}</p>

        {activeUsers.map(user => (
          <img
            key={user.id}
            src={user.avatar_url || "/placeholder.svg"}
            alt={user.name || user.email || "User"}
            title={user.name || user.email || "User"}
            className="w-8 h-8 rounded-full border bg-white"
          />
        ))}
      </div>
    </header>
  );
}
