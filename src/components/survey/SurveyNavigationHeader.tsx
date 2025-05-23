
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSurveyData } from '@/hooks/useSurveyData';

export function SurveyNavigationHeader() {
  const navigate = useNavigate();
  const { id: surveyId } = useParams();
  const { surveyData } = useSurveyData();

  // Find current survey name if we're viewing a specific survey
  const getCurrentSurveyName = () => {
    if (!surveyId || !surveyData) return null;
    
    // Check unorganized surveys
    const unorganizedSurvey = surveyData.unorganizedSurveys.find(s => s.id === surveyId);
    if (unorganizedSurvey) return unorganizedSurvey.name;
    
    // Check folders
    for (const folder of surveyData.folders) {
      const survey = folder.surveys.find(s => s.id === surveyId);
      if (survey) return survey.name;
    }
    
    return null;
  };

  const currentSurveyName = getCurrentSurveyName();

  return (
    <header className="h-14 border-b bg-background px-4 flex items-center justify-between">
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
        
        {currentSurveyName && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{currentSurveyName}</span>
            </div>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>
    </header>
  );
}
