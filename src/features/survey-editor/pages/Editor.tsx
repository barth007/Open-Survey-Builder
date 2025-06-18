import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { debugLog, debugWarn } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActiveUser } from '@/types/survey-organization';

import { useSurveyState } from '../hooks/useSurveyState'; 
import { useAnswersTab } from '../hooks/useAnswersTab';   
import SurveyLayout from '../components/SurveyLayout';     
import SurveyTitle from '../components/SurveyTitle';       
import AnswersTab from '../components/AnswersTab';

import { WelcomeCard } from '../components/WelcomeCard';
import { QuestionSection } from '../components/QuestionSection';
import { ThankYouCard } from '../components/ThankYouCard';
import { SurveyRecordingSettings } from '../components/SurveyRecordingSettings';
import { SurveyNavigationHeader } from '../components/SurveyNavigationHeader';
import PreviewTab from '../components/PreviewTab';
import { WelcomePage } from '../components/WelcomePage';
import { ThankYouPage } from '../components/ThankYouPage';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SurveySidebar } from '@/components/survey/SurveySidebar';

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';


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
    isSaving,
    isTyping,
    lastSaved,
    retryCount,
    isLoading,
    error
  } = useSurveyState(surveyId);

  useEffect(() => {
    if (survey.title) {
      document.title = survey.title;
    }
  }, [survey.title]);

  // Debug logging for recording settings
  useEffect(() => {
    debugLog("Survey data for recording settings:", {
      surveyId,
      recordingEnabled: survey.recordingEnabled,
      recordingRequired: survey.recordingRequired,
      surveyTitle: survey.title
    });
  }, [surveyId, survey.recordingEnabled, survey.recordingRequired, survey.title]);

  // Optimized update functions with smart batching
  const updateSurveyWithTracking = (updates: Partial<typeof survey>) => {
    debugLog("Batched update:", updates);
    Object.entries(updates).forEach(([key, value]) => {
      updateSurveyField(key as keyof typeof survey, value);
    });
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
  } = useAnswersTab(survey, surveyId);

  // Create status text for navigation header
  const getStatusText = () => {
    if (isTyping) return "Typing...";
    if (isSaving) return "Saving...";
    return null;
  };

  // Don't render anything if no surveyId
  if (!surveyId) {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <SurveySidebar />
          <div className="flex-1 min-h-0">
            <SurveyNavigationHeader
              activeUsers={activeUsers}
              isSaving={isSaving}
              lastSaved={lastSaved}
              survey={survey}
              onPublishToggle={togglePublish}
              statusText={getStatusText()}
            />
            <SurveyLayout 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
            >
              <div className="flex items-center justify-center h-full">
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
          <div className="flex-1 min-h-0">
            <SurveyNavigationHeader
              activeUsers={activeUsers}
              isSaving={isSaving}
              lastSaved={lastSaved}
              survey={survey}
              onPublishToggle={togglePublish}
              statusText={getStatusText()}
            />
            <SurveyLayout 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 max-w-md text-magma">
                  <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
                  <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
                  {retryCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">Retrying... (attempt {retryCount})</p>
                  )}
                </div>
              </div>
            </SurveyLayout>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  debugLog("Rendering survey editor with recording settings component");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SurveySidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <SurveyNavigationHeader
            activeUsers={activeUsers}
            isSaving={isSaving}
            lastSaved={lastSaved}
            survey={survey}
            onPublishToggle={togglePublish}
            statusText={getStatusText()}
          />
          <SurveyLayout 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
          >
            <div className="bg-gray-100 p-4 h-full flex flex-col min-h-0">
              {activeTab === "edit" && (
                <ResizablePanelGroup direction="horizontal" className="w-full flex-1 min-h-0 rounded-xl">
                  <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 min-h-0 bg-white">
                    <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hover pr-2 gap-4 p-4">

                      <SurveyTitle
                        title={survey.title}
                        description={survey.description}
                        onTitleChange={handleTitleChange}
                        onDescriptionChange={handleDescriptionChange}
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
                        onQuestionChange={updateQuestion}
                        onDeleteQuestion={deleteQuestion}
                        onDuplicateQuestion={duplicateQuestion}
                        onAddQuestion={addQuestion}
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
                <div className="h-full flex-1 min-h-0">
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
                </div>
              )}
            </div>
          </SurveyLayout>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Index;
