
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Filter, Tag, Scale, AlertTriangle, Minimize2, Maximize2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { StatisticalInsights } from '@/components/survey/analysis/StatisticalInsights';
import { ScaleMapping } from '@/components/survey/analysis/ScaleMapping';
import { OutlierDetection } from '@/components/survey/analysis/OutlierDetection';

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
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState<'tagging' | 'statistics' | 'scale' | 'outliers'>('tagging');

  // Add a new tag to a response
  const handleAddTag = (answer: string) => {
    if (!newTag.trim() || !responseData) return;
    
    const questionId = responseData.questionId;
    const key = `${questionId}-${answer}`;
    
    setTags(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newTag.trim()]
    }));
    
    setNewTag("");
  };

  // Remove a tag from a response
  const handleRemoveTag = (answer: string, tagToRemove: string) => {
    if (!responseData) return;
    
    const questionId = responseData.questionId;
    const key = `${questionId}-${answer}`;
    
    setTags(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(tag => tag !== tagToRemove)
    }));
  };

  // Get tags for a specific answer
  const getTagsForAnswer = (answer: string): string[] => {
    if (!responseData) return [];
    
    const questionId = responseData.questionId;
    const key = `${questionId}-${answer}`;
    
    return tags[key] || [];
  };

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <Button 
          variant="ghost" 
          onClick={onToggleVisibility}
          className="p-2 h-auto"
          title="Show analysis panel"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="h-full border-ice">
      <CardHeader className="border-b border-ice">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Analysis Panel</CardTitle>
          {onToggleVisibility && (
            <Button 
              variant="ghost" 
              onClick={onToggleVisibility}
              className="p-1 h-auto"
              title="Hide analysis panel"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!selectedResponseGroup ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Database className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a group of answers to analyze</h3>
            <p className="text-gray-500 max-w-md">
              Click on a response card on the left to view detailed analysis and statistical insights
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-carbon">
              {responseData?.question}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
              <Button 
                variant={activeTab === 'tagging' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('tagging')}
                className="flex-grow md:flex-grow-0"
              >
                <Tag className="mr-1 h-4 w-4" /> Tagging
              </Button>
              <Button 
                variant={activeTab === 'statistics' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setActiveTab('statistics')}
                className="flex-grow md:flex-grow-0"
              >
                <Filter className="mr-1 h-4 w-4" /> Statistics
              </Button>
              {responseData?.likert && (
                <>
                  <Button 
                    variant={activeTab === 'scale' ? 'default' : 'outline'}
                    size="sm" 
                    onClick={() => setActiveTab('scale')}
                    className="flex-grow md:flex-grow-0"
                  >
                    <Scale className="mr-1 h-4 w-4" /> Scale Mapping
                  </Button>
                  <Button 
                    variant={activeTab === 'outliers' ? 'default' : 'outline'}
                    size="sm" 
                    onClick={() => setActiveTab('outliers')}
                    className="flex-grow md:flex-grow-0"
                  >
                    <AlertTriangle className="mr-1 h-4 w-4" /> Outliers
                  </Button>
                </>
              )}
            </div>

            {activeTab === 'tagging' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border border-ice">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-blue-600" /> Response Tagging
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Add tags to categorize and group similar responses for easier analysis.
                  </p>
                  
                  <div className="space-y-4">
                    {responseData?.responses.map(response => (
                      <div key={response.answer} className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{response.answer}</span>
                          <span className="text-sm text-gray-500">{response.count} responses</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getTagsForAnswer(response.answer).map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="flex items-center gap-1 bg-blue-50"
                            >
                              {tag}
                              <button 
                                className="ml-1 text-gray-500 hover:text-red-500"
                                onClick={() => handleRemoveTag(response.answer, tag)}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Input 
                            placeholder="Add a tag..." 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="text-sm h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTag(response.answer);
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAddTag(response.answer)}
                            className="h-8"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
      </CardContent>
    </Card>
  );
};
