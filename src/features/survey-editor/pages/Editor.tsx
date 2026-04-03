import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { debugLog, debugWarn } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActiveUser } from '@/types/survey-organization';
import { Question, QuestionType, QuestionOption } from '@/types/survey';

import { useSurveyState } from '../hooks/useSurveyState';
import { useAnswersTab } from '../hooks/useAnswersTab';
import SurveyLayout from '../components/SurveyLayout';
import AnswersTab from '../components/AnswersTab';

import { WelcomeCard } from '../components/WelcomeCard';
import { QuestionSection } from '../components/QuestionSection';
import { ThankYouCard } from '../components/ThankYouCard';
import { SurveyAppearanceCard } from '../components/SurveyAppearanceCard';
import { SurveyBrandingCard } from '../components/SurveyBrandingCard';
import { ShareMetadataCard } from '../components/ShareMetadataCard';
import { FormSettingsCard } from '../components/FormSettingsCard';
import { EmailNotificationsCard } from '../components/EmailNotificationsCard';
import { DataRetentionCard } from '../components/DataRetentionCard';
import { DeliveryModesCard } from '../components/DeliveryModesCard';
import { SurveyRecordingSettings } from '../components/SurveyRecordingSettings';
import { SurveyNavigationHeader } from '../components/SurveyNavigationHeader';
import PreviewTab from '../components/PreviewTab';
import { EditorSkeleton } from '../components/EditorSkeleton';
import { RecordingsTab } from '../components/RecordingsTab';
import { BlockInserter } from '../components/BlockInserter';
import { EditorTabCanvas } from '../components/EditorTabCanvas';
import { QuestionSettingsPopover } from '../components/QuestionSettingsPopover';
import { BulkInsertOptionsDialog } from '../components/BulkInsertOptionsDialog';
import { type EditorInsertType } from '../lib/editor-blocks';
import { getActiveQuestionShortcutAction } from '../lib/editor-shortcuts';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SurveySidebar } from '@/features/survey-editor/components/SurveySidebar';


const SurveyEditorPage = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'design' | 'settings' | 'answers' | 'recordings'>('edit');
  const [inserterOpen, setInserterOpen] = useState(false);
  const [inserterPos, setInserterPos] = useState({ top: 0, left: 0 });
  const [insertIndex, setInsertIndex] = useState<number | undefined>(undefined);

  // Active question state for the settings popover
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [popoverAnchorRect, setPopoverAnchorRect] = useState<DOMRect | null>(null);
  const activeQuestionElementRef = useRef<HTMLElement | null>(null);
  const [bulkInsertOpen, setBulkInsertOpen] = useState(false);
  // logicQuestionId is independent from activeQuestionId so interacting with the
  // logic panel (which deactivates the question) doesn't close it.
  const [logicQuestionId, setLogicQuestionId] = useState<string | null>(null);
  const logicQuestionIdRef = useRef<string | null>(null);

  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!surveyId) navigate('/dashboard');
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
    isSaving,
    lastSaved,
    retryCount,
    isLoading,
    error,
  } = useSurveyState(surveyId);

  useEffect(() => {
    if (survey?.title) document.title = survey.title;
  }, [survey?.title]);

  // Keep ref in sync for the auto-close effect below
  useEffect(() => { logicQuestionIdRef.current = logicQuestionId; }, [logicQuestionId]);

  // Close logic only when the user moves to a *different* block — not when
  // activeQuestionId goes null (e.g. clicking inside the logic panel).
  useEffect(() => {
    if (activeQuestionId !== null && activeQuestionId !== logicQuestionIdRef.current) {
      setLogicQuestionId(null);
    }
  }, [activeQuestionId]);

  const handleUpdateQuestions = (updatedQuestions: Question[]) => {
    updateSurveyField('questions', updatedQuestions);
  };

  const {
    chartType,
    filterText,
    setFilterText,
    sortBy,
    setSortBy,
    responses,
    submissionResponses,
    isLoading: responsesLoading,
    error: responsesError,
    filteredResponses,
    totalResponses,
    exportToCSV,
    handleChartTypeChange,
  } = useAnswersTab(survey, surveyId);

  const openBlockInserter = useCallback((nextInsertIndex?: number, rect?: DOMRect) => {
    setInsertIndex(nextInsertIndex);
    setInserterPos({
      top: rect ? rect.bottom + 12 : 200,
      left: rect ? rect.left + Math.max(rect.width / 2 - 160, 0) : window.innerWidth / 2 - 160,
    });
    setInserterOpen(true);
  }, []);

  // '/' shortcut to open block inserter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && activeTab === 'edit' && !inserterOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        openBlockInserter(survey?.questions.length);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, inserterOpen, openBlockInserter, survey?.questions.length]);

  // Keyboard shortcuts operating on active question
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeQuestionId || activeTab !== 'edit') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const activeQuestion = survey?.questions.find((q) => q.id === activeQuestionId) ?? null;
      const action = getActiveQuestionShortcutAction(
        {
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        },
        activeQuestion,
      );

      switch (action) {
        case 'close':
          setActiveQuestionId(null);
          setPopoverAnchorRect(null);
          return;
        case 'delete':
          deleteQuestion(activeQuestionId);
          setActiveQuestionId(null);
          setPopoverAnchorRect(null);
          return;
        case 'duplicate':
          e.preventDefault();
          if (activeQuestion) duplicateQuestion(activeQuestion);
          return;
        case 'toggle-visibility':
          e.preventDefault();
          if (activeQuestion) {
            updateQuestion({ ...activeQuestion, isVisible: activeQuestion.isVisible === false ? true : false });
          }
          return;
        case 'bulk-insert':
          e.preventDefault();
          setBulkInsertOpen(true);
          return;
        case 'toggle-logic':
          e.preventDefault();
          setLogicQuestionId((v) => (v ? null : activeQuestionId));
          return;
        default:
          return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeQuestionId, activeTab, deleteQuestion, duplicateQuestion, updateQuestion, survey?.questions]);

  // Keep popover rect in sync with scroll
  useEffect(() => {
    const update = () => {
      if (activeQuestionElementRef.current) {
        setPopoverAnchorRect(activeQuestionElementRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleActivateQuestion = useCallback((questionId: string, element: HTMLElement) => {
    setActiveQuestionId(questionId);
    activeQuestionElementRef.current = element;
    setPopoverAnchorRect(element.getBoundingClientRect());
  }, []);

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId);
    setPopoverAnchorRect(null);
    activeQuestionElementRef.current = null;
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveQuestionId(null);
    setPopoverAnchorRect(null);
    activeQuestionElementRef.current = null;
  }, []);

  const handleBlockSelect = (type: EditorInsertType) => {
    setInserterOpen(false);
    setInsertIndex(undefined);
    if (type === 'welcome') {
      updateSurveyField('welcomeTitle', 'Welcome');
    } else if (type === 'thanks') {
      updateSurveyField('thankYouTitle', 'Thank You');
    } else {
      addQuestion(type, insertIndex);
    }
  };

  const activeQuestion = survey?.questions.find((q) => q.id === activeQuestionId) ?? null;

  const handleBulkInsert = (options: QuestionOption[]) => {
    if (!activeQuestion) return;
    updateQuestion({
      ...activeQuestion,
      options: [...activeQuestion.options, ...options],
    });
  };

  if (!surveyId || !survey) return null;

  return (
    <SidebarProvider>
      {inserterOpen && (
        <BlockInserter
          anchorPosition={inserterPos}
          onSelect={handleBlockSelect}
          onClose={() => setInserterOpen(false)}
        />
      )}

      {/* Settings popover */}
      {activeQuestion && popoverAnchorRect && activeTab === 'edit' && (
        <QuestionSettingsPopover
          question={activeQuestion}
          questions={survey.questions}
          anchorRect={popoverAnchorRect}
          onQuestionChange={updateQuestion}
          onDelete={() => {
            deleteQuestion(activeQuestion.id);
            handleDeactivate();
          }}
          onDuplicate={() => duplicateQuestion(activeQuestion)}
          onBulkInsert={() => setBulkInsertOpen(true)}
          onOpenLogic={() => setLogicQuestionId(activeQuestionId)}
          onClose={handleDeactivate}
        />
      )}

      {/* Bulk insert dialog */}
      <BulkInsertOptionsDialog
        open={bulkInsertOpen}
        onOpenChange={setBulkInsertOpen}
        onInsert={handleBulkInsert}
      />

      <div className="flex min-h-screen w-full bg-background">
        <SurveySidebar />
        <SidebarInset className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <SurveyNavigationHeader
            activeUsers={activeUsers}
            isSaving={isSaving}
            lastSaved={lastSaved}
            survey={survey}
            onPublishToggle={togglePublish}
          />
          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <EditorSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 max-w-md text-destructive">
                  <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
                  <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
                  <Button variant="outline" className="mt-6 gap-2" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <SurveyLayout activeTab={activeTab} setActiveTab={setActiveTab}>
                {activeTab === 'edit' && (
                  <EditorTabCanvas
                    contentClassName="space-y-6"
                    onCanvasClick={handleDeactivate}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <WelcomeCard
                        welcomeTitle={survey.welcomeTitle || ''}
                        welcomeMessage={survey.welcomeMessage || ''}
                        welcomeInstructions={survey.welcomeInstructions || ''}
                        welcomeButtonText={survey.welcomeButtonText || ''}
                        onWelcomeTitleChange={(v) => updateSurveyField('welcomeTitle', v)}
                        onWelcomeMessageChange={(v) => updateSurveyField('welcomeMessage', v)}
                        onWelcomeInstructionsChange={(v) => updateSurveyField('welcomeInstructions', v)}
                        onWelcomeButtonTextChange={(v) => updateSurveyField('welcomeButtonText', v)}
                      />
                    </div>

                    <QuestionSection
                      questions={survey.questions}
                      activeQuestionId={activeQuestionId}
                      logicQuestionId={logicQuestionId}
                      onSelectQuestion={handleSelectQuestion}
                      onActivateQuestion={handleActivateQuestion}
                      onUpdateQuestions={handleUpdateQuestions}
                      onDeleteQuestion={deleteQuestion}
                      onDuplicateQuestion={(q: Question) => duplicateQuestion(q)}
                      updateQuestion={updateQuestion}
                      onOpenInserter={openBlockInserter}
                      onCloseLogic={() => setLogicQuestionId(null)}
                    />

                    <div onClick={(e) => e.stopPropagation()}>
                      <ThankYouCard
                        thankYouTitle={survey.thankYouTitle || ''}
                        thankYouMessage={survey.thankYouMessage || ''}
                        thankYouButtonText={survey.thankYouButtonText || ''}
                        redirectUrl={survey.redirectUrl || ''}
                        onThankYouTitleChange={(v) => updateSurveyField('thankYouTitle', v)}
                        onThankYouMessageChange={(v) => updateSurveyField('thankYouMessage', v)}
                        onThankYouButtonTextChange={(v) => updateSurveyField('thankYouButtonText', v)}
                        onRedirectUrlChange={(v) => updateSurveyField('redirectUrl', v)}
                      />
                    </div>

                    <div className="h-64 w-full" />
                  </EditorTabCanvas>
                )}

                {activeTab === 'design' && (
                  <EditorTabCanvas contentClassName="space-y-8">
                    <SurveyAppearanceCard
                      appearance={survey.appearance}
                      onAppearanceChange={(v) => updateSurveyField('appearance', v)}
                    />
                    <SurveyBrandingCard
                      branding={survey.branding}
                      onBrandingChange={(v) => updateSurveyField('branding', v)}
                    />
                    <ShareMetadataCard
                      shareMeta={survey.shareMeta}
                      seo={survey.seo}
                      onShareMetaChange={(v) => updateSurveyField('shareMeta', v)}
                      onSeoChange={(v) => updateSurveyField('seo', v)}
                    />
                    <div className="h-64 w-full" />
                  </EditorTabCanvas>
                )}

                {activeTab === 'settings' && (
                  <EditorTabCanvas contentClassName="space-y-8">
                    <FormSettingsCard
                      settings={survey.settings}
                      onSettingsChange={(v) => updateSurveyField('settings', v)}
                    />
                    <EmailNotificationsCard
                      notifications={survey.notifications}
                      onNotificationsChange={(v) => updateSurveyField('notifications', v)}
                    />
                    <DataRetentionCard
                      retention={survey.retention}
                      onRetentionChange={(v) => updateSurveyField('retention', v)}
                    />
                    <DeliveryModesCard
                      publicCode={survey.publicCode}
                      delivery={survey.delivery}
                      onDeliveryChange={(v) => updateSurveyField('delivery', v)}
                    />
                    <SurveyRecordingSettings
                      survey={survey}
                      onSurveyChange={updateSurveyField}
                    />
                    <div className="h-64 w-full" />
                  </EditorTabCanvas>
                )}

                {activeTab === 'answers' && (
                  <div className="h-full flex-1 min-h-0">
                    <AnswersTab
                      survey={survey}
                      responses={responses}
                      submissionResponses={submissionResponses}
                      isLoading={responsesLoading}
                      error={responsesError instanceof Error ? responsesError : responsesError ? new Error(String(responsesError)) : null}
                      filteredResponses={filteredResponses}
                      totalResponses={totalResponses}
                      filterText={filterText}
                      setFilterText={setFilterText}
                      sortBy={sortBy}
                      setSortBy={(value: string) => setSortBy(value as 'default' | 'count' | 'alpha')}
                      chartType={chartType}
                      handleChartTypeChange={handleChartTypeChange}
                      exportToCSV={exportToCSV}
                    />
                  </div>
                )}

                {activeTab === 'recordings' && (
                  <div className="flex-1 overflow-hidden">
                    <RecordingsTab surveyId={surveyId} />
                  </div>
                )}
              </SurveyLayout>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SurveyEditorPage;
