import React, { useState } from 'react';
import { Survey } from '@/types/survey';
import { SummaryCard } from '@/components/survey/analysis/SummaryCard';
import { FilterControls } from '@/components/survey/analysis/FilterControls';
import { NoResponsesView } from '@/components/survey/analysis/NoResponsesView';
import { ResponsesList } from '@/components/survey/analysis/ResponsesList';
import { DeleteResponsesDialog } from '@/components/survey/analysis/DeleteResponsesDialog';
import { AnalysisPanel } from '@/components/survey/analysis/AnalysisPanel';
import { ResponseDebugView } from '@/components/survey/analysis/ResponseDebugView';
import { useDeleteResponses } from '@/hooks/survey/useDeleteResponses';
import { useQueryClient } from '@tanstack/react-query';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Bug, Eye, EyeOff } from "lucide-react";
import { getResponseProcessingStats } from '@/components/survey/analysis/ResponsesProcessor';

interface AnswersTabProps {
  survey: Survey;
  responses: any[];
  filteredResponses: any[];
  totalResponses: number;
  filterText: string;
  setFilterText: (value: string) => void;
  sortBy: "default" | "count" | "alpha";
  setSortBy: (value: "default" | "count" | "alpha") => void;
  chartType: string;
  handleChartTypeChange: (value: string) => void;
  onCardClick: (id: string) => void;
  exportToCSV: () => void;
  selectedResponseGroup: string | null;
}

const AnswersTab: React.FC<AnswersTabProps> = ({
  survey,
  responses,
  filteredResponses,
  totalResponses,
  filterText,
  setFilterText,
  sortBy,
  setSortBy,
  chartType,
  handleChartTypeChange,
  onCardClick,
  exportToCSV,
  selectedResponseGroup,
}) => {
  const [filteredParticipant, setFilteredParticipant] = useState<{ id: string; email: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{ id: string; email: string } | null>(null);
  const [participantResponseCount, setParticipantResponseCount] = useState(0);
  const [analysisPanelVisible, setAnalysisPanelVisible] = useState(true);
  const [debugViewVisible, setDebugViewVisible] = useState(false);
  
  const { deleteResponsesByParticipant, isDeleting } = useDeleteResponses();
  const queryClient = useQueryClient();

  const stats = getResponseProcessingStats(survey, responses);
  const hasDataIssues = stats.orphanedResponses > 0 || (totalResponses > 0 && filteredResponses.length === 0);

  const handleParticipantFilter = (participantId: string, participantEmail: string) => {
    if (!participantId && !participantEmail) {
      setFilteredParticipant(null);
      setParticipantResponseCount(0);
      return;
    }

    // Count responses for this participant
    // Note: This is a simplified count. In a real implementation, you'd query the database
    const count = responses.length; // Placeholder - would need actual filtering logic
    
    setFilteredParticipant({ id: participantId, email: participantEmail });
    setParticipantResponseCount(count);
  };

  const handleDeleteRequest = (participantId: string, participantEmail: string) => {
    setPendingDeletion({ id: participantId, email: participantEmail });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (reason: string, softDelete: boolean) => {
    if (!pendingDeletion) return;

    try {
      await deleteResponsesByParticipant(
        survey.id,
        pendingDeletion.id || undefined,
        pendingDeletion.email || undefined,
        softDelete,
        reason || undefined
      );

      // Refresh the responses data
      queryClient.invalidateQueries({ queryKey: ['surveyResponses', survey.id] });
      
      // Clear the filter after successful deletion
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

  const selectedResponseData = selectedResponseGroup 
    ? filteredResponses.find(r => r.questionId === selectedResponseGroup)
    : null;

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      <ResizablePanel defaultSize={50} minSize={20} className="min-w-0 min-h-0">
        <div className="flex flex-col h-full bg-white">
          <div className="flex justify-between items-center px-4 py-2 border-b bg-white flex-shrink-0">
            <div className="font-medium text-sm">Responses</div>
            <div className="flex items-center gap-2">
              {hasDataIssues && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDebugViewVisible(!debugViewVisible)}
                  className="flex items-center gap-2"
                >
                  <Bug size={16} />
                  {debugViewVisible ? 'Hide Debug' : 'Debug Data'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-white">
            <div className="space-y-8 pb-8">
              <SummaryCard responses={responses} onExportCSV={exportToCSV} />

              {hasDataIssues && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <Bug size={16} />
                    <span className="font-medium">Data Mismatch Detected</span>
                  </div>
                  <p className="text-sm text-orange-600 mb-3">
                    Some responses may not be showing because question IDs have changed. 
                    {stats.orphanedResponses > 0 && ` Found ${stats.orphanedResponses} orphaned responses.`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDebugViewVisible(true)}
                    className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    View Debug Information
                  </Button>
                </div>
              )}

              {debugViewVisible && (
                <ResponseDebugView survey={survey} responses={responses} />
              )}

              {totalResponses === 0 ? (
                <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
              ) : filteredResponses.length === 0 && !debugViewVisible ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <p className="text-lg font-medium mb-2">No Matching Responses Found</p>
                    <p className="text-sm">
                      You have {totalResponses} total responses, but none match the current survey structure.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setDebugViewVisible(true)}
                    className="flex items-center gap-2"
                  >
                    <Bug size={16} />
                    Debug Response Data
                  </Button>
                </div>
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

                  <ResponsesList
                    responseGroups={filteredResponses}
                    sortBy={sortBy}
                    selectedResponseGroup={selectedResponseGroup}
                    chartTypes={{ [selectedResponseGroup || "default"]: chartType as "bar" | "pie" }}
                    onChartTypeChange={handleChartTypeChange}
                    onCardClick={onCardClick}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </ResizablePanel>

      {analysisPanelVisible && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25} className="min-w-0 min-h-0">
            <AnalysisPanel 
              selectedResponseGroup={selectedResponseGroup}
              responseData={selectedResponseData}
              onToggleVisibility={() => setAnalysisPanelVisible(false)}
              surveyId={survey.id}
            />
          </ResizablePanel>
        </>
      )}

      <DeleteResponsesDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        participantInfo={getParticipantDisplayName()}
        responseCount={participantResponseCount}
        isDeleting={isDeleting}
      />
    </ResizablePanelGroup>
  );
};

export default AnswersTab;
