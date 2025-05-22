
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useSurveyState } from '@/hooks/useSurveyState';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useAutoSave } from '@/hooks/survey/useAutoSave';
import { useIsMobile } from '@/hooks/use-mobile';

import SurveyHeader from '@/components/survey/SurveyHeader';
import SurveyTabs from '@/components/survey/SurveyTabs';
import EditTab from '@/components/survey/EditTab';
import AnswersTab from '@/components/AnswersTab';
import { SplitPanelLayout } from "@/components/ui/split-panel-layout";
import { useAnswersTab } from '@/components/survey/analysis/useAnswersTab';
import { AnalysisPanel } from '@/components/survey/analysis/AnalysisPanel';
import { PreviewPanel } from '@/components/survey/edit/PreviewPanel';

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

  function updateSurvey(updates: Partial<typeof survey>) {
    if (!surveyId) return;
    queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
    setPendingChanges(true);
  }

  const {
    chartType,
    filterText,
    setFilterText,
    sortBy,
    setSortBy,
    selectedResponseGroup,
    responses,
    filteredResponses,
    totalResponses,
    exportToCSV,
    handleChartTypeChange,
    handleCardClick,
    selectedResponseData
  } = useAnswersTab(survey);

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <SurveyHeader 
          survey={{ 
            ...survey,
            // Ensure isPublished is always defined
            isPublished: survey.isPublished ?? false 
          }}
          pendingChanges={pendingChanges}
          activeUsers={activeUsers}
          onPublishToggle={togglePublish}
        />
      </div>

      <SurveyTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 overflow-hidden w-full max-w-screen-2xl mx-auto">
        {activeTab === "edit" && (
          <SplitPanelLayout
            middlePanel={
              <EditTab
                survey={survey}
                onTitleChange={handleSurveyTitleChange}
                onDescriptionChange={handleDescriptionChangeWithTracking}
                onQuestionChange={handleQuestionChange}
                onDeleteQuestion={handleDeleteQuestion}
                onDuplicateQuestion={handleDuplicateQuestion}
                onAddQuestion={handleAddQuestion}
                onWelcomeTitleChange={(value) => updateSurvey({ welcomeTitle: value })}
                onWelcomeMessageChange={(value) => updateSurvey({ welcomeMessage: value })}
                onWelcomeInstructionsChange={(value) => updateSurvey({ welcomeInstructions: value })}
                onWelcomeButtonTextChange={(value) => updateSurvey({ welcomeButtonText: value })}
                onThankYouTitleChange={(value) => updateSurvey({ thankYouTitle: value })}
                onThankYouMessageChange={(value) => updateSurvey({ thankYouMessage: value })}
                onThankYouButtonTextChange={(value) => updateSurvey({ thankYouButtonText: value })}
                onRedirectUrlChange={(value) => updateSurvey({ redirectUrl: value })}
              />
            }
            rightPanel={<PreviewPanel survey={survey} />}
            middlePanelTitle="Editor"
            rightPanelTitle="Preview"
          />
        )}

        {activeTab === "answers" && (
          <SplitPanelLayout
            middlePanel={
              <AnswersTab
                survey={survey}
                responses={responses}
                filteredResponses={filteredResponses}
                totalResponses={totalResponses}
                filterText={filterText}
                setFilterText={setFilterText}
                sortBy={sortBy}
                setSortBy={(value: string) => setSortBy(value as "default" | "count" | "alpha")}
                chartType={chartType[selectedResponseGroup] || "bar"}
                handleChartTypeChange={(value: string) => {
                  const [questionId, type] = value.split(':');
                  handleChartTypeChange(questionId, type as "bar" | "pie");
                }}
                onCardClick={handleCardClick}
                exportToCSV={exportToCSV}
                selectedResponseGroup={selectedResponseGroup}
              />
            }
            rightPanel={
              selectedResponseGroup ? (
                <AnalysisPanel
                  selectedResponseGroup={selectedResponseGroup}
                  responseData={selectedResponseData}
                  onToggleVisibility={() => {}}
                />
              ) : (
                <div className="text-center text-gray-500 text-sm p-6">No question selected</div>
              )
            }
            middlePanelTitle="Responses"
            rightPanelTitle="Analysis"
          />
        )}
      </div>
    </div>
  );
};

export default Index;
