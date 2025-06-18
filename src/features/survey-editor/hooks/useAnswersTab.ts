
import { useState, useMemo } from 'react';
import { Survey } from '@/types/survey';
import { useQuerySurveyResponses } from '@/hooks/survey/useQuerySurveyResponses';
import { processResponses, filterResponseGroups, getResponseProcessingStats } from '../lib/ResponsesProcessor';
import { useCSVExporter } from '../lib/CSVExporter';


export function useAnswersTab(survey: Survey, surveyId: string | undefined) {
  const [chartType, setChartType] = useState<Record<string, "bar" | "pie">>({});
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "count" | "alpha">("default");
  const [selectedResponseGroup, setSelectedResponseGroup] = useState<string | null>(null);
  
  // Fetch responses data
  const { data: responses, isLoading, error } = useQuerySurveyResponses(surveyId);
  
  // Process the responses with enhanced logic
  const processedResponses = useMemo(() => {
    const processed = processResponses(survey, responses);
    console.log('Enhanced processed responses:', processed);
    return processed;
  }, [responses, survey]);
  
  // Filter responses by question text
  const filteredResponses = useMemo(() => 
    filterResponseGroups(processedResponses, filterText),
    [processedResponses, filterText]
  );

  // Calculate total responses and processing stats
  const totalResponses = responses?.length || 0;
  const processingStats = useMemo(() => 
    getResponseProcessingStats(survey, responses),
    [survey, responses]
  );
  
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
    processingStats,
    exportToCSV,
    handleChartTypeChange,
    handleCardClick,
    selectedResponseData
  };
}
