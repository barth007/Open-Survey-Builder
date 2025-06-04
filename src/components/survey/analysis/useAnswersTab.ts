
import { useState, useMemo } from 'react';
import { Survey } from '@/types/survey';
import { useQuerySurveyResponses } from '@/hooks/survey/useQuerySurveyResponses';
import { 
  processResponses, 
  filterResponseGroups,
  ProcessedResponseGroup 
} from './ResponsesProcessor';
import { useCSVExporter } from './CSVExporter';

export function useAnswersTab(survey: Survey, surveyId: string | undefined) {
  const [chartType, setChartType] = useState<Record<string, "bar" | "pie">>({});
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "count" | "alpha">("default");
  const [selectedResponseGroup, setSelectedResponseGroup] = useState<string | null>(null);
  
  // Fetch responses data
  const { data: responses, isLoading, error } = useQuerySurveyResponses(surveyId);
  
  // Process the responses
  const processedResponses = useMemo(() => 
    processResponses(survey, responses), 
    [responses, survey]
  );
  
  // Filter responses by question text
  const filteredResponses = useMemo(() => 
    filterResponseGroups(processedResponses, filterText),
    [processedResponses, filterText]
  );

  // Calculate total responses
  const totalResponses = responses?.length || 0;
  
  // CSV export functionality
  const { exportToCSV } = useCSVExporter(processedResponses, survey.title);
  
  // Handle chart type change
  const handleChartTypeChange = (questionId: string, type: "bar" | "pie") => {
    setChartType(prev => ({
      ...prev,
      [questionId]: type
    }));
  };
  
  // Handle card click
  const handleCardClick = (questionId: string) => {
    setSelectedResponseGroup(questionId === selectedResponseGroup ? null : questionId);
  };
  
  // Get the selected response group data
  const selectedResponseData = useMemo(() => 
    selectedResponseGroup ? processedResponses.find(r => r.questionId === selectedResponseGroup) : null,
    [selectedResponseGroup, processedResponses]
  );

  return {
    chartType,
    filterText,
    setFilterText,
    sortBy,
    setSortBy,
    selectedResponseGroup,
    responses,
    isLoading,
    error,
    processedResponses,
    filteredResponses,
    totalResponses,
    exportToCSV,
    handleChartTypeChange,
    handleCardClick,
    selectedResponseData
  };
}
