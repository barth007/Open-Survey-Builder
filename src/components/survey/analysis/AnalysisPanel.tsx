
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatisticalInsights } from '@/components/survey/analysis/StatisticalInsights';
import { ScaleMapping } from '@/components/survey/analysis/ScaleMapping';
import { OutlierDetection } from '@/components/survey/analysis/OutlierDetection';
import { EmptyAnalysisState } from './panel/EmptyAnalysisState';
import { AnalysisPanelHeader } from './panel/AnalysisPanelHeader';
import { AnalysisTabs } from './panel/AnalysisTabs';
import { TaggingTab } from './panel/TaggingTab';
import { CollapsedAnalysisPanel } from './panel/CollapsedAnalysisPanel';
import { InsightsSummary } from './InsightsSummary';

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

interface AnalysisPanelProps {
  selectedResponseGroup: string | null;
  responseData: ResponseGroup | null;
  onToggleVisibility?: () => void;
  isCollapsed?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  selectedResponseGroup,
  responseData,
  onToggleVisibility,
  isCollapsed = false
}) => {
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<'tagging' | 'statistics' | 'scale' | 'outliers' | 'summary'>('tagging');
  const [researcherNotes, setResearcherNotes] = useState<string>('');
  
  // Initialize scale values based on response data
  const [scaleValues, setScaleValues] = useState<ScaleValues>(() => {
    if (!responseData) return {};
    const initialValues: ScaleValues = {};
    responseData.responses.forEach((response, index) => {
      initialValues[response.answer] = index + 1;
    });
    return initialValues;
  });

  // Update scale values when response data changes
  React.useEffect(() => {
    if (responseData) {
      const newScaleValues: ScaleValues = {};
      responseData.responses.forEach((response, index) => {
        newScaleValues[response.answer] = index + 1;
      });
      setScaleValues(newScaleValues);
    }
  }, [responseData]);

  if (isCollapsed) {
    return <CollapsedAnalysisPanel onToggleVisibility={onToggleVisibility!} />;
  }

  return (
    <Card className="h-full border-ice overflow-hidden">
      <AnalysisPanelHeader onToggleVisibility={onToggleVisibility} />
      <CardContent className="p-0 overflow-hidden h-[calc(100%-57px)]">
        <ScrollArea className="h-full">
          <div className="p-6">
            {!selectedResponseGroup ? (
              <EmptyAnalysisState />
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-carbon break-words">
                  {responseData?.question}
                </h3>

                <AnalysisTabs 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                  isLikert={responseData?.likert || false}
                />

                {activeTab === 'tagging' && responseData && (
                  <TaggingTab responseData={responseData} tags={tags} setTags={setTags} />
                )}

                {activeTab === 'statistics' && responseData && (
                  <StatisticalInsights 
                    responseData={responseData} 
                    scaleValues={scaleValues}
                  />
                )}

                {activeTab === 'scale' && responseData?.likert && (
                  <ScaleMapping 
                    responseData={responseData} 
                    scaleValues={scaleValues}
                    setScaleValues={setScaleValues}
                  />
                )}

                {activeTab === 'outliers' && responseData?.likert && (
                  <OutlierDetection responseData={responseData} />
                )}

                {activeTab === 'summary' && responseData && (
                  <InsightsSummary 
                    responseData={responseData}
                    scaleValues={scaleValues}
                    tags={tags}
                    researcherNotes={researcherNotes}
                    setResearcherNotes={setResearcherNotes}
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
