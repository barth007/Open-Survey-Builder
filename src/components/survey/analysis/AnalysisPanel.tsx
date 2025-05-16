
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
  const [activeTab, setActiveTab] = useState<'tagging' | 'statistics' | 'scale' | 'outliers'>('tagging');

  if (isCollapsed) {
    return <CollapsedAnalysisPanel onToggleVisibility={onToggleVisibility!} />;
  }

  return (
    <Card className="h-full border-ice overflow-hidden">
      <AnalysisPanelHeader onToggleVisibility={onToggleVisibility} />
      <CardContent className="p-0 overflow-hidden h-[calc(100%-57px)]"> {/* Adjust height to account for header */}
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
                  <StatisticalInsights responseData={responseData} />
                )}

                {activeTab === 'scale' && responseData?.likert && (
                  <ScaleMapping responseData={responseData} />
                )}

                {activeTab === 'outliers' && responseData?.likert && (
                  <OutlierDetection responseData={responseData} />
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
