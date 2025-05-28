
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useSurveyState } from '@/hooks/useSurveyState';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useAutoSave } from '@/hooks/survey/useAutoSave';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActiveUser } from '@/types/survey-organization';
import AnswersTab from '@/components/AnswersTab';
import { SplitPanelLayout } from "@/components/ui/split-panel-layout";
import { useAnswersTab } from '@/components/survey/analysis/useAnswersTab';
import { AnalysisPanel } from '@/components/survey/analysis/AnalysisPanel';
import SurveyLayout from '@/components/ui/SurveyLayout';
import SurveyTitle from '@/components/SurveyTitle';
import { WelcomeCard } from '@/components/survey/edit/WelcomeCard';
import { QuestionSection } from '@/components/survey/edit/QuestionSection';
import { ThankYouCard } from '@/components/survey/edit/ThankYouCard';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import PreviewTab from '@/components/survey/PreviewTab';
import { WelcomePage } from '@/components/survey/WelcomePage';
import { ThankYouPage } from '@/components/survey/ThankYouPage';
import { SidebarProvider } from "@/components/ui/sidebar";
import { SurveySidebar } from '@/components/survey/SurveySidebar';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "answers">("edit");
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Redirect to dashboard if no surveyId
  useEffect(() => {
    if (!surveyId) {
      navigate('/dashboard');
      return;
    }
  }, [surveyId, navigate]);

  const { activeUsers } = useActiveUsers(surveyId) as { activeUsers: ActiveUser[] };

  const {
    survey,
    handleTitleChange,
    handleDescriptionChange,
    updateSurveyField,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    togglePublish,
    handleSave,
    pendingChanges,
    setPendingChanges,
    isLoading,
    error
  } = useSurveyState(surveyId);

  const { isSaving, lastSaved } = useAutoSave({ 
    onSave: handleSave,
    delay: 2000,
    pendingChanges,
    setPendingChanges
  });

  useEffect(() => {
    if (survey.title) {
      document.title = survey.title;
    }
  }, [survey.title]);

  const handleQuestionChange = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion);
    setPendingChanges(true);
  };

  const handleDescriptionChangeWithTracking = (description: string) => {
    handleDescriptionChange(description);
    setPendingChanges(true);
  };

  const handleTitleChangeWithTracking = (title: string) => {
    handleTitleChange(title);
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

  const updateSurveyWithTracking = (updates: Partial<typeof survey>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateSurveyField(key as keyof typeof survey, value);
    });
    setPendingChanges(true);
  };

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

  // Don't render anything if no surveyId
  if (!surveyId) {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <SurveySidebar />
          <div className="flex-1">
            <SurveyLayout 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              isSaving={isSaving}
              lastSaved={lastSaved}
              survey={survey}
              onPublishToggle={togglePublish}
            >
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
              </div>
            </SurveyLayout>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <SurveySidebar />
          <div className="flex-1">
            <SurveyLayout 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              isSaving={isSaving}
              lastSaved={lastSaved}
              survey={survey}
              onPublishToggle={togglePublish}
            >
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 max-w-md text-magma">
                  <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
                  <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
                </div>
              </div>
            </SurveyLayout>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SurveySidebar />
        <div className="flex-1">
          <SurveyLayout 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isSaving={isSaving}
            lastSaved={lastSaved}
            survey={survey}
            onPublishToggle={togglePublish}
          >
            <div className="rounded-xl shadow-sm bg-gray-100 p-4 h-full">
              {activeTab === "edit" && (
                <ResizablePanelGroup direction="horizontal" className="w-full h-full overflow-hidden min-w-0 min-h-0 rounded-xl">
                  <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 min-h-0 bg-white">
                    <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hover pr-2 gap-4 p-4">

                      <SurveyTitle
                        title={survey.title}
                        description={survey.description}
                        onTitleChange={handleTitleChangeWithTracking}
                        onDescriptionChange={handleDescriptionChangeWithTracking}
                      />

                      <WelcomeCard
                        welcomeTitle={survey.welcomeTitle || ''}
                        welcomeMessage={survey.welcomeMessage || ''}
                        welcomeInstructions={survey.welcomeInstructions || ''}
                        welcomeButtonText={survey.welcomeButtonText || ''}
                        onWelcomeTitleChange={(v) => updateSurveyWithTracking({ welcomeTitle: v })}
                        onWelcomeMessageChange={(v) => updateSurveyWithTracking({ welcomeMessage: v })}
                        onWelcomeInstructionsChange={(v) => updateSurveyWithTracking({ welcomeInstructions: v })}
                        onWelcomeButtonTextChange={(v) => updateSurveyWithTracking({ welcomeButtonText: v })}
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
                        onThankYouTitleChange={(v) => updateSurveyWithTracking({ thankYouTitle: v })}
                        onThankYouMessageChange={(v) => updateSurveyWithTracking({ thankYouMessage: v })}
                        onThankYouButtonTextChange={(v) => updateSurveyWithTracking({ thankYouButtonText: v })}
                        onRedirectUrlChange={(v) => updateSurveyWithTracking({ redirectUrl: v })}
                      />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 min-h-0 bg-white">
                    <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hover pr-2 gap-4 p-4">

                      {(survey.welcomeTitle || survey.welcomeMessage || survey.welcomeInstructions || survey.welcomeButtonText) && (
                        <WelcomePage
                          welcomeTitle={survey.welcomeTitle || ''}
                          welcomeMessage={survey.welcomeMessage || ''}
                          welcomeInstructions={survey.welcomeInstructions || ''}
                          welcomeButtonText={survey.welcomeButtonText || ''}
                        />
                      )}

                      {survey.questions?.length > 0 && (
                        <PreviewTab survey={survey} key={`preview-${survey.id}-${survey.questions.length}`} />
                      )}

                      {(survey.thankYouTitle || survey.thankYouMessage || survey.thankYouButtonText || survey.redirectUrl) && (
                        <ThankYouPage
                          thankYouTitle={survey.thankYouTitle || ''}
                          thankYouMessage={survey.thankYouMessage || ''}
                          thankYouButtonText={survey.thankYouButtonText || ''}
                          redirectUrl={survey.redirectUrl || ''}
                        />
                      )}

                      {!survey.welcomeTitle && !survey.welcomeMessage && !survey.welcomeInstructions && !survey.welcomeButtonText && 
                       !survey.questions?.length && 
                       !survey.thankYouTitle && !survey.thankYouMessage && !survey.thankYouButtonText && !survey.redirectUrl && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Start building your survey to see the preview</p>
                        </div>
                      )}

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
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Index;
