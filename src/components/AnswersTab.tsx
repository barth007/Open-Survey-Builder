import React, { useState } from 'react';
import { Survey } from '@/types/survey';
import { SummaryCard } from '@/components/survey/analysis/SummaryCard';
import { FilterControls } from '@/components/survey/analysis/FilterControls';
import { NoResponsesView } from '@/components/survey/analysis/NoResponsesView';
import { ResponsesList } from '@/components/survey/analysis/ResponsesList';
import { DeleteResponsesDialog } from '@/components/survey/analysis/DeleteResponsesDialog';
import { useDeleteResponses } from '@/hooks/survey/useDeleteResponses';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const { deleteResponsesByParticipant, isDeleting } = useDeleteResponses();
  const queryClient = useQueryClient();

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4">
        <SummaryCard responses={responses} onExportCSV={exportToCSV} />
      </div>

      {totalResponses === 0 ? (
        <div className="flex-1 px-6 py-4">
          <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="flex-1 px-6 py-4">
          <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
        </div>
      ) : (
        <>
          <div className="flex-shrink-0 px-6 py-2">
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
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 pb-6">
              <ResponsesList
                responseGroups={filteredResponses}
                sortBy={sortBy}
                selectedResponseGroup={selectedResponseGroup}
                chartTypes={{ [selectedResponseGroup || "default"]: chartType as "bar" | "pie" }}
                onChartTypeChange={handleChartTypeChange}
                onCardClick={onCardClick}
              />
            </div>
          </ScrollArea>
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
    </div>
  );
};

export default AnswersTab;
