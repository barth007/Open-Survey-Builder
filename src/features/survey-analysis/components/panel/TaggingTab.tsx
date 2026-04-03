
import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { ResponseTagItem } from './ResponseTagItem';

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

interface TaggingTabProps {
  responseData: ResponseGroup;
  tags: Record<string, string[]>;
  setTags: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

export const TaggingTab: React.FC<TaggingTabProps> = ({ responseData, tags, setTags }) => {
  // Add a new tag to a response
  const handleAddTag = (answer: string, newTag: string) => {
    if (!newTag || !responseData) return;
    
    const questionId = responseData.questionId;
    const key = `${questionId}-${answer}`;
    
    setTags(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newTag]
    }));
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

  return (
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
            <ResponseTagItem 
              key={response.answer}
              response={response}
              tags={getTagsForAnswer(response.answer)}
              onAddTag={(newTag) => handleAddTag(response.answer, newTag)}
              onRemoveTag={(tag) => handleRemoveTag(response.answer, tag)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
