
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useSurveyState } from '@/hooks/useSurveyState';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useAutoSave } from '@/hooks/survey/useAutoSave';
import SurveyHeader from '@/components/survey/SurveyHeader';
import SurveyTabs from '@/components/survey/SurveyTabs';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "answers">("edit");
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { activeUsers } = useActiveUsers(surveyId);
  
  const {
    survey,
    handleTitleChange,
    handleDescriptionChange,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    togglePublish,
    handleSave,
    isLoading,
    error
  } = useSurveyState(surveyId);

  const { pendingChanges, setPendingChanges } = useAutoSave({ onSave: handleSave });

  useEffect(() => {
    if (survey.title) {
      document.title = survey.title;
    }
  }, [survey.title]);

  const handleSurveyTitleChange = (title: string) => {
    handleTitleChange(title);
    setPendingChanges(true);
    if (surveyId) {
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, title, name: title };
      });
    }
  };

  const handleQuestionChange = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion);
    setPendingChanges(true);
  };

  const handleDescriptionChangeWithTracking = (description: string) => {
    handleDescriptionChange(description);
    setPendingChanges(true);
  };

  const handleAddQuestion = () => {
    addQuestion();
    setPendingChanges(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setPendingChanges(true);
  };

  const handleDuplicateQuestion = (question: any) => {
    duplicateQuestion(question);
    setPendingChanges(true);
  };

  // Helper function to update survey properties
  function updateSurvey(updates: Partial<typeof survey>) {
    if (!surveyId) return;

    queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
    
    setPendingChanges(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
          <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!surveyId) {
    return (
      <div className="h-screen overflow-hidden">
        <SurveyTabs 
          activeTab="edit"
          setActiveTab={setActiveTab}
          survey={{ id: "", title: "", description: "", questions: [], isPublished: false }}
          onTitleChange={() => {}}
          onDescriptionChange={() => {}}
          onQuestionChange={() => {}}
          onDeleteQuestion={() => {}}
          onDuplicateQuestion={() => {}}
          onAddQuestion={() => {}}
          onWelcomeTitleChange={() => {}}
          onWelcomeMessageChange={() => {}}
          onWelcomeInstructionsChange={() => {}}
          onWelcomeButtonTextChange={() => {}}
          onThankYouTitleChange={() => {}}
          onThankYouMessageChange={() => {}}
          onThankYouButtonTextChange={() => {}}
          onRedirectUrlChange={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <SurveyHeader 
          survey={survey}
          pendingChanges={pendingChanges}
          activeUsers={activeUsers}
          onPublishToggle={togglePublish}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <SurveyTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          survey={survey}
          onTitleChange={handleSurveyTitleChange}
          onDescriptionChange={handleDescriptionChangeWithTracking}
          onQuestionChange={handleQuestionChange}
          onDeleteQuestion={handleDeleteQuestion}
          onDuplicateQuestion={handleDuplicateQuestion}
          onAddQuestion={handleAddQuestion}
          onWelcomeTitleChange={(welcomeTitle) => updateSurvey({ welcomeTitle })}
          onWelcomeMessageChange={(welcomeMessage) => updateSurvey({ welcomeMessage })}
          onWelcomeInstructionsChange={(welcomeInstructions) => updateSurvey({ welcomeInstructions })}
          onWelcomeButtonTextChange={(welcomeButtonText) => updateSurvey({ welcomeButtonText })}
          onThankYouTitleChange={(thankYouTitle) => updateSurvey({ thankYouTitle })}
          onThankYouMessageChange={(thankYouMessage) => updateSurvey({ thankYouMessage })}
          onThankYouButtonTextChange={(thankYouButtonText) => updateSurvey({ thankYouButtonText })}
          onRedirectUrlChange={(redirectUrl) => updateSurvey({ redirectUrl })}
        />
      </div>
    </div>
  );
};

export default Index;
