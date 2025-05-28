import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useSurveyState } from '@/hooks/useSurveyState';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useAutoSave } from '@/hooks/survey/useAutoSave';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActiveUser } from '@/types/survey-organization';
import EditTab from '@/components/survey/EditTab';
import AnswersTab from '@/components/AnswersTab';
import { SplitPanelLayout } from "@/components/ui/split-panel-layout";
import { useAnswersTab } from '@/components/survey/analysis/useAnswersTab';
import { AnalysisPanel } from '@/components/survey/analysis/AnalysisPanel';
import { PreviewPanel } from '@/components/survey/edit/PreviewPanel';
import SurveyLayout from '@/components/ui/SurveyLayout';
import SurveyTitle from '@/components/SurveyTitle';
import { WelcomeCard } from '@/components/survey/edit/WelcomeCard';
import { QuestionSection } from '@/components/survey/edit/QuestionSection';
import { ThankYouCard } from '@/components/survey/edit/ThankYouCard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "answers">("edit");
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Make sure activeUsers are the correct type
  const { activeUsers } = useActiveUsers(surveyId) as { activeUsers: ActiveUser[] };

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
      <SurveyLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
        </div>
      </SurveyLayout>
    );
  }

  if (error) {
    return (
      <SurveyLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8 max-w-md text-magma">
            <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
            <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  return (
    <SurveyLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="rounded-xl shadow-sm bg-gray-100 p-4 h-full">
        {activeTab === "edit" && (
          <ResizablePanelGroup direction="horizontal" className="w-full h-full overflow-hidden min-w-0 min-h-0 rounded-xl">
            {/* Middle Panel */}
            <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 min-h-0 bg-white">
            <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hover pr-2 gap-4 p-4">
                <SurveyTitle
                  title={survey.title}
                  description={survey.description}
                  onTitleChange={handleSurveyTitleChange}
                  onDescriptionChange={handleDescriptionChangeWithTracking}
                />

                <WelcomeCard
                  welcomeTitle={survey.welcomeTitle || ''}
                  welcomeMessage={survey.welcomeMessage || ''}
                  welcomeInstructions={survey.welcomeInstructions || ''}
                  welcomeButtonText={survey.welcomeButtonText || ''}
                  onWelcomeTitleChange={(v) => updateSurvey({ welcomeTitle: v })}
                  onWelcomeMessageChange={(v) => updateSurvey({ welcomeMessage: v })}
                  onWelcomeInstructionsChange={(v) => updateSurvey({ welcomeInstructions: v })}
                  onWelcomeButtonTextChange={(v) => updateSurvey({ welcomeButtonText: v })}
                />

                <QuestionSection
                  questions={survey.questions}
                  onQuestionChange={handleQuestionChange}
                  onDeleteQuestion={handleDeleteQuestion}
                  onDuplicateQuestion={handleDuplicateQuestion}
                  onAddQuestion={handleAddQuestion}
                />

                <ThankYouCard
                  thankYouTitle={survey.thankYouTitle || ''}
                  thankYouMessage={survey.thankYouMessage || ''}
                  thankYouButtonText={survey.thankYouButtonText || ''}
                  redirectUrl={survey.redirectUrl || ''}
                  onThankYouTitleChange={(v) => updateSurvey({ thankYouTitle: v })}
                  onThankYouMessageChange={(v) => updateSurvey({ thankYouMessage: v })}
                  onThankYouButtonTextChange={(v) => updateSurvey({ thankYouButtonText: v })}
                  onRedirectUrlChange={(v) => updateSurvey({ redirectUrl: v })}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel */}
            <ResizablePanel defaultSize={50} minSize={25} className="overflow-auto min-w-0 bg-gray-50">
              <div className="h-full w-full px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-500 mb-2">Preview</h2>
                <PreviewPanel survey={survey} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
                  onToggleVisibility={() => { }}
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
    </SurveyLayout>
  );
}

export default Index;
