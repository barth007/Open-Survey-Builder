import React from 'react';
import { Survey } from '@/types/survey';
import { SummaryCard } from '@/components/survey/analysis/SummaryCard';
import { FilterControls } from '@/components/survey/analysis/FilterControls';
import { NoResponsesView } from '@/components/survey/analysis/NoResponsesView';
import { ResponsesList } from '@/components/survey/analysis/ResponsesList';

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
  return (
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
            chartTypes={{ [selectedResponseGroup || "default"]: chartType as "bar" | "pie" }}
            onChartTypeChange={handleChartTypeChange}
            onCardClick={onCardClick}
          />
        </>
      )}
    </div>
  );
};

export default AnswersTab;
