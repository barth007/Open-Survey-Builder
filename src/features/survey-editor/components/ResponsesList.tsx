
import React from 'react';
import { ProcessedResponseGroup, sortResponses } from './../lib/ResponsesProcessor';
import { ResponseCardItem } from '@/features/survey-analysis/components/ResponseCardItem';

interface ResponsesListProps {
  responseGroups: ProcessedResponseGroup[];
  sortBy: "default" | "count" | "alpha";
  selectedResponseGroup: string | null;
  chartTypes: Record<string, "bar" | "pie">;
  onChartTypeChange: (questionId: string, type: "bar" | "pie") => void;
  onCardClick: (questionId: string) => void;
}

export const ResponsesList: React.FC<ResponsesListProps> = ({
  responseGroups,
  sortBy,
  selectedResponseGroup,
  chartTypes,
  onChartTypeChange,
  onCardClick
}) => {
  console.log('Rendering ResponsesList with', responseGroups.length, 'response groups');
  
  return (
    <>
      {responseGroups.map((item) => {
        const sortedResponses = sortResponses(item.responses, sortBy);
        const currentChartType = chartTypes[item.questionId] || "bar";
        const isSelected = selectedResponseGroup === item.questionId;

        return (
          <ResponseCardItem
            key={item.questionId}
            item={{
              ...item,
              responses: sortedResponses
            }}
            isSelected={isSelected}
            chartType={currentChartType}
            onChartTypeChange={onChartTypeChange}
            onClick={() => onCardClick(item.questionId)}
          />
        );
      })}
    </>
  );
};
