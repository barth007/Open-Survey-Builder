import React from 'react';
import { FileText, Download, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

interface ResponseGroup {
  questionId: string;
  question: string;
  responses: ResponseData[];
  likert: boolean;
}

interface ScaleValues {
  [key: string]: number;
}

interface InsightsSummaryProps {
  responseData: ResponseGroup;
  scaleValues: ScaleValues;
  tags: Record<string, string[]>;
  researcherNotes: string;
  setResearcherNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const InsightsSummary: React.FC<InsightsSummaryProps> = ({
  responseData,
  scaleValues,
  tags,
  researcherNotes,
  setResearcherNotes
}) => {
  // Calculate key statistics
  const totalResponses = responseData.responses.reduce((sum, r) => sum + r.count, 0);
  const uniqueAnswers = responseData.responses.length;
  
  // Find mode (most common answer)
  const mode = [...responseData.responses].sort((a, b) => b.count - a.count)[0]?.answer;
  
  // Calculate weighted average if it's a Likert scale
  const calculateWeightedAverage = () => {
    if (!responseData.likert || !scaleValues) return null;
    
    let totalWeightedSum = 0;
    let totalCount = 0;
    
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer] || 0;
      totalWeightedSum += numericValue * response.count;
      totalCount += response.count;
    });
    
    return totalCount > 0 ? (totalWeightedSum / totalCount).toFixed(2) : null;
  };

  // Calculate median
  const calculateMedian = () => {
    if (!responseData.likert || !scaleValues) return null;
    
    const numericAnswers: number[] = [];
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer];
      if (numericValue !== undefined) {
        for (let i = 0; i < response.count; i++) {
          numericAnswers.push(numericValue);
        }
      }
    });
    
    if (numericAnswers.length === 0) return null;
    numericAnswers.sort((a, b) => a - b);
    
    let medianValue: number;
    if (numericAnswers.length % 2 === 0) {
      const mid = numericAnswers.length / 2;
      medianValue = (numericAnswers[mid - 1] + numericAnswers[mid]) / 2;
    } else {
      const mid = Math.floor(numericAnswers.length / 2);
      medianValue = numericAnswers[mid];
    }
    
    // Find closest answer to median value
    let closestAnswer = responseData.responses[0]?.answer;
    let closestDiff = Infinity;
    
    responseData.responses.forEach(response => {
      const value = scaleValues[response.answer];
      if (value !== undefined) {
        const diff = Math.abs(value - medianValue);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestAnswer = response.answer;
        }
      }
    });
    
    return closestAnswer;
  };

  // Analyze trend
  const analyzeTrend = () => {
    if (!responseData.likert || !scaleValues) return 'N/A';
    
    const weightedAvg = parseFloat(calculateWeightedAverage() || '0');
    const scaleRange = Object.values(scaleValues);
    const minScale = Math.min(...scaleRange);
    const maxScale = Math.max(...scaleRange);
    const midpoint = (minScale + maxScale) / 2;
    
    if (weightedAvg > midpoint + (maxScale - minScale) * 0.15) {
      return 'Skewed towards higher values';
    } else if (weightedAvg < midpoint - (maxScale - minScale) * 0.15) {
      return 'Skewed towards lower values';
    } else {
      return 'Centered distribution';
    }
  };

  // Get tag summary
  const getTagSummary = () => {
    const questionTags = tags[responseData.questionId] || [];
    const tagCounts: Record<string, number> = {};
    
    questionTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    return tagCounts;
  };

  // Export to markdown
  const exportToMarkdown = () => {
    const weightedAvg = calculateWeightedAverage();
    const median = calculateMedian();
    const trend = analyzeTrend();
    const tagSummary = getTagSummary();
    
    let markdown = `# Survey Analysis Summary\n\n`;
    markdown += `**Question:** ${responseData.question}\n\n`;
    
    markdown += `## Response Overview\n`;
    markdown += `- Total responses: ${totalResponses}\n`;
    markdown += `- Unique answers: ${uniqueAnswers}\n\n`;
    
    if (responseData.likert) {
      markdown += `## Statistical Summary\n`;
      markdown += `- Mode (most common): ${mode}\n`;
      if (median) markdown += `- Median: ${median}\n`;
      if (weightedAvg) markdown += `- Weighted average: ${weightedAvg}\n`;
      markdown += `- Trend: ${trend}\n\n`;
    }
    
    if (Object.keys(tagSummary).length > 0) {
      markdown += `## Tags Summary\n`;
      Object.entries(tagSummary).forEach(([tag, count]) => {
        markdown += `- ${tag}: ${count}\n`;
      });
      markdown += `\n`;
    }
    
    if (researcherNotes.trim()) {
      markdown += `## Researcher Notes\n`;
      markdown += `${researcherNotes}\n\n`;
    }
    
    markdown += `## Response Distribution\n`;
    responseData.responses.forEach(response => {
      markdown += `- ${response.answer}: ${response.count} (${response.percentage}%)\n`;
    });
    
    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-analysis-${responseData.questionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const weightedAvg = calculateWeightedAverage();
  const median = calculateMedian();
  const trend = analyzeTrend();
  const tagSummary = getTagSummary();

  return (
    <div 
      className="space-y-6" 
      role="region" 
      aria-label="Summary insights"
      id="summary-panel"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
          <h4 className="font-medium text-sm">Summary Insights</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToMarkdown}
          aria-label="Export summary as markdown file"
        >
          <Download className="mr-1 h-4 w-4" aria-hidden="true" />
          Export
        </Button>
      </div>

      {/* Response Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Response Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total responses:</span>
            <span 
              className="font-medium"
              aria-label={`Total responses: ${totalResponses}`}
            >
              {totalResponses}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Unique answers:</span>
            <span 
              className="font-medium"
              aria-label={`Unique answers: ${uniqueAnswers}`}
            >
              {uniqueAnswers}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Summary */}
      {responseData.likert && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Statistical Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mode (most common):</span>
              <span 
                className="font-medium"
                aria-label={`Most common response: ${mode}`}
              >
                {mode}
              </span>
            </div>
            {median && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Median:</span>
                <span 
                  className="font-medium"
                  aria-label={`Median response: ${median}`}
                >
                  {median}
                </span>
              </div>
            )}
            {weightedAvg && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Weighted average:</span>
                <span 
                  className="font-medium"
                  aria-label={`Weighted average score: ${weightedAvg}`}
                >
                  {weightedAvg}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trend:</span>
              <span 
                className="font-medium"
                aria-label={`Response trend: ${trend}`}
              >
                {trend}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Summary */}
      {Object.keys(tagSummary).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tags Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(tagSummary).map(([tag, count]) => (
              <div key={tag} className="flex justify-between text-sm">
                <span className="text-gray-500">{tag}:</span>
                <span 
                  className="font-medium"
                  aria-label={`Tag ${tag}: ${count} occurrences`}
                >
                  {count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Researcher Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <StickyNote className="h-4 w-4 mr-2" aria-hidden="true" />
            Researcher Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your research notes, observations, or interpretations here..."
            value={researcherNotes}
            onChange={(e) => setResearcherNotes(e.target.value)}
            className="min-h-[100px] resize-none"
            aria-label="Researcher notes textarea"
            aria-describedby="notes-description"
          />
          <p id="notes-description" className="sr-only">
            This field allows you to add your research notes, observations, or interpretations about the survey responses.
          </p>
        </CardContent>
      </Card>

      {/* Response Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Response Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {responseData.responses.map(response => (
            <div key={response.answer} className="flex justify-between text-sm">
              <span className="text-gray-500 truncate flex-1 mr-2">{response.answer}:</span>
              <span 
                className="font-medium"
                aria-label={`${response.answer}: ${response.count} responses, ${response.percentage} percent`}
              >
                {response.count} ({response.percentage}%)
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
