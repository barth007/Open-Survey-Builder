import React, { useState } from 'react';
import { Bug, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useQueryClient } from '@tanstack/react-query';
import { AnalysisPanel } from '@/features/survey-editor/components/AnalysisPanel';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeleteResponses } from '@/hooks/survey/useDeleteResponses';
import { Survey, SurveyResponse } from '@/types/survey';
import { DeleteResponsesDialog } from '@/features/survey-editor/components/DeleteResponsesDialog';
import { FilterControls } from '@/features/survey-editor/components/FilterControls';
import { NoResponsesView } from '@/features/survey-editor/components/NoResponsesView';
import { ResponseDebugView } from '@/features/survey-editor/components/ResponseDebugView';
import { ResponsesList } from '@/features/survey-editor/components/ResponsesList';
import { SubmissionsTableView } from '@/features/survey-editor/components/SubmissionsTableView';
import { SummaryCard } from '@/features/survey-editor/components/SummaryCard';
import { EditorTabCanvas } from '@/features/survey-editor/components/EditorTabCanvas';
import { getResponseProcessingStats, ProcessedResponseGroup } from '@/features/survey-editor/lib/ResponsesProcessor';

interface AnswersTabProps {
  survey: Survey;
  responses: SurveyResponse[];
  isLoading?: boolean;
  error?: Error | null;
  filteredResponses: ProcessedResponseGroup[];
  totalResponses: number;
  filterText: string;
  setFilterText: (value: string) => void;
  sortBy: 'default' | 'count' | 'alpha';
  setSortBy: (value: 'default' | 'count' | 'alpha') => void;
  chartType: Record<string, 'bar' | 'pie'>;
  handleChartTypeChange: (questionId: string, type: 'bar' | 'pie') => void;
  exportToCSV: () => void;
}

const AnswersTab: React.FC<AnswersTabProps> = ({
  survey,
  responses,
  isLoading,
  error,
  filteredResponses,
  totalResponses,
  filterText,
  setFilterText,
  sortBy,
  setSortBy,
  chartType,
  handleChartTypeChange,
  exportToCSV,
}) => {
  const [filteredParticipant, setFilteredParticipant] = useState<{ id: string; email: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{ id: string; email: string } | null>(null);
  const [participantResponseCount, setParticipantResponseCount] = useState(0);
  const [debugViewVisible, setDebugViewVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'submissions'>('summary');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { deleteResponsesByParticipant, isDeleting } = useDeleteResponses();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState title="Failed to load responses" message={error.message} />;
  }

  const stats = getResponseProcessingStats(survey, responses);
  const hasDataIssues = stats.orphanedResponses > 0 || (totalResponses > 0 && filteredResponses.length === 0);

  const handleParticipantFilter = (participantId: string, participantEmail: string) => {
    if (!participantId && !participantEmail) {
      setFilteredParticipant(null);
      setParticipantResponseCount(0);
      return;
    }

    const count = responses.filter((response) =>
      (participantId && response.participantId === participantId) ||
      (participantEmail && response.metadata?.email === participantEmail),
    ).length;

    setFilteredParticipant({ id: participantId, email: participantEmail });
    setParticipantResponseCount(count);
  };

  const handleDeleteRequest = (participantId: string, participantEmail: string) => {
    setPendingDeletion({ id: participantId, email: participantEmail });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (softDelete: boolean) => {
    if (!pendingDeletion) return;

    try {
      await deleteResponsesByParticipant(
        survey.id,
        pendingDeletion.id || undefined,
        pendingDeletion.email || undefined,
        softDelete,
      );

      queryClient.invalidateQueries({ queryKey: ['surveyResponses', survey.id] });
      setFilteredParticipant(null);
      setParticipantResponseCount(0);
    } catch (error) {
      console.error('Failed to delete responses:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeletion(null);
    }
  };

  const getParticipantDisplayName = () => {
    if (!pendingDeletion) return '';
    if (pendingDeletion.email) return pendingDeletion.email;
    if (pendingDeletion.id) return `ID: ${pendingDeletion.id}`;
    return 'Unknown participant';
  };

  const showNoMatches = totalResponses > 0 && filteredResponses.length === 0 && !debugViewVisible;

  return (
    <EditorTabCanvas width="wide" contentClassName="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center rounded-2xl border border-border/70 bg-background p-1 shadow-[0_10px_24px_rgba(15,15,15,0.04)] sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setViewMode('summary')}
              className={cn(
                'h-10 flex-1 rounded-2xl px-4 text-sm font-medium sm:flex-none',
                viewMode === 'summary'
                  ? 'bg-[#111111] text-white hover:bg-[#111111]/95 hover:text-white'
                  : 'text-muted-foreground hover:bg-muted/[0.18] hover:text-foreground',
              )}
            >
              Summary
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode('submissions')}
              className={cn(
                'h-10 flex-1 rounded-2xl px-4 text-sm font-medium sm:flex-none',
                viewMode === 'submissions'
                  ? 'bg-[#111111] text-white hover:bg-[#111111]/95 hover:text-white'
                  : 'text-muted-foreground hover:bg-muted/[0.18] hover:text-foreground',
              )}
            >
              Submissions
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'summary' && hasDataIssues && (
              <Button
                variant="outline"
                onClick={() => setDebugViewVisible((visible) => !visible)}
                className="h-10 rounded-full border-border/70 px-4 text-sm font-medium"
              >
                <Bug className="mr-2 h-4 w-4" />
                {debugViewVisible ? 'Hide diagnostics' : 'Diagnostics'}
              </Button>
            )}

            <Button
              onClick={exportToCSV}
              variant="outline"
              className="h-10 rounded-full border-border/70 bg-background px-4 text-sm font-medium shadow-none"
              disabled={responses.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="space-y-8">
            <SummaryCard
              responses={responses}
              stats={stats}
            />

            {hasDataIssues && (
              <section className="rounded-[30px] border border-orange-200 bg-orange-50/80 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-white/70">
                    <Bug className="h-4 w-4 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Some submissions no longer match the current survey structure.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-orange-800/85">
                      Question IDs or answer shapes changed after data had already been collected.
                      {stats.orphanedResponses > 0 && ` ${stats.orphanedResponses} orphaned submissions were detected.`}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {debugViewVisible && (
              <ResponseDebugView survey={survey} responses={responses} />
            )}

            {totalResponses === 0 ? (
              <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
            ) : showNoMatches ? (
              <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
            ) : (
              <>
                <FilterControls
                  filterText={filterText}
                  setFilterText={setFilterText}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  showParticipantFilter={true}
                  onParticipantFilter={handleParticipantFilter}
                  onDeleteRequest={handleDeleteRequest}
                  filteredParticipant={filteredParticipant}
                  participantResponseCount={participantResponseCount}
                />

                <p className="text-sm text-muted-foreground">
                  {filteredResponses.length} question{filteredResponses.length === 1 ? '' : 's'}
                </p>

                <ResponsesList
                  responseGroups={filteredResponses}
                  sortBy={sortBy}
                  chartTypes={chartType}
                  onChartTypeChange={handleChartTypeChange}
                  onSelectGroup={setSelectedGroupId}
                />
              </>
            )}
          </div>
        ) : (
          totalResponses === 0 ? (
            <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
          ) : (
            <SubmissionsTableView
              survey={survey}
              responses={responses}
            />
          )
        )}

      <DeleteResponsesDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        participantInfo={getParticipantDisplayName()}
        responseCount={participantResponseCount}
        isDeleting={isDeleting}
      />

      <Sheet open={selectedGroupId !== null} onOpenChange={(open) => { if (!open) setSelectedGroupId(null); }}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto">
          <AnalysisPanel
            selectedResponseGroup={selectedGroupId}
            responseData={filteredResponses.find(g => g.questionId === selectedGroupId) ?? null}
            surveyId={survey.id}
          />
        </SheetContent>
      </Sheet>
    </EditorTabCanvas>
  );
};

export default AnswersTab;
