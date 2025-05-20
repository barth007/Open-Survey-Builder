
import React from 'react';
import { Survey } from '@/types/survey';
import { SplitPanelLayout } from '@/components/ui/split-panel-layout';
import { AnalysisPanel } from '@/components/survey/analysis/AnalysisPanel';
import { SummaryCard } from './SummaryCard';
import { FilterControls } from './FilterControls';
import { NoResponsesView } from './NoResponsesView';
import { ResponsesList } from './ResponsesList';
import { useAnswersTab } from './useAnswersTab';
import { EmptyAnalysisState } from './panel/EmptyAnalysisState';

interface AnswersTabContentProps {
  survey: Survey;
}

export const AnswersTabContent: React.FC<AnswersTabContentProps> = ({ survey }) => {
  const {
    chartType,
    filterText,
    setFilterText,
    sortBy,
    setSortBy,
    selectedResponseGroup,
    responses,
    isLoading,
    error,
    filteredResponses,
    processedResponses,
    totalResponses,
    exportToCSV,
    handleChartTypeChange,
    handleCardClick,
    selectedResponseData
  } = useAnswersTab(survey);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-ice">
        <p className="text-magma font-medium">Error loading survey responses</p>
        <p className="text-gray-500 mt-2">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      </div>
    );
  }
  
  // Responses panel content
  const responsesPanel = (
    <div className="space-y-8">
      <SummaryCard responses={responses} onExportCSV={exportToCSV} />

      {totalResponses === 0 ? (
        <NoResponsesView 
          totalResponses={totalResponses} 
          hasFilteredResponses={false} 
        />
      ) : filteredResponses.length === 0 ? (
        <NoResponsesView 
          totalResponses={totalResponses} 
          hasFilteredResponses={false} 
        />
      ) : (
        <>
          <FilterControls 
            filterText={filterText}
            setFilterText={setFilterText}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <ResponsesList 
            responseGroups={filteredResponses}
            sortBy={sortBy}
            selectedResponseGroup={selectedResponseGroup}
            chartTypes={chartType}
            onChartTypeChange={handleChartTypeChange}
            onCardClick={handleCardClick}
          />
        </>
      )}
    </div>
  );

  // Analysis panel content with empty state handling
  const analysisPanel = selectedResponseGroup ? (
    <AnalysisPanel 
      selectedResponseGroup={selectedResponseGroup}
      responseData={selectedResponseData}
      onToggleVisibility={() => {}}
    />
  ) : (
    <EmptyAnalysisState />
  );

  // Use a 60/40 layout distribution for the answers tab (left panel wider than right)
  return (
    <SplitPanelLayout
      leftPanel={responsesPanel}
      rightPanel={analysisPanel}
      leftPanelTitle="Responses"
      rightPanelTitle="Analysis"
      defaultLayout={[60, 40]} 
      minSizes={["40%", "30%"]}
    />
  );
};
