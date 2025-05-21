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

  // Main content panel: Summary + Filters + Responses List
  const responsesPanel = (
    <div className="px-6 py-4 space-y-8">
      <SummaryCard responses={responses} onExportCSV={exportToCSV} />

      {totalResponses === 0 ? (
        <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
      ) : filteredResponses.length === 0 ? (
        <NoResponsesView totalResponses={totalResponses} hasFilteredResponses={false} />
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

  // Analysis panel
  const analysisPanel = selectedResponseGroup ? (
    <AnalysisPanel
      selectedResponseGroup={selectedResponseGroup}
      responseData={selectedResponseData}
      onToggleVisibility={() => {}}
    />
  ) : (
    <EmptyAnalysisState />
  );

  return (
    <SplitPanelLayout
      leftPanel={null} // reserved for future use (e.g. nav, tabs)
      middlePanel={responsesPanel}
      rightPanel={analysisPanel}
      leftPanelTitle={null}
      rightPanelTitle="Analysis"
      defaultLayout={[20, 60, 20]}
      minSizes={["10%", "40%", "30%"]}
    />
  );
};
