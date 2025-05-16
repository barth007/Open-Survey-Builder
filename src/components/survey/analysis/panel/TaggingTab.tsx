
import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [newTag, setNewTag] = useState("");

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
            <div key={response.answer} className="border-b border-gray-100 pb-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium break-words pr-2" style={{ maxWidth: '70%', overflowWrap: 'break-word' }}>
                  {response.answer}
                </span>
                <span className="text-sm text-gray-500 whitespace-nowrap">{response.count} responses</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {getTagsForAnswer(response.answer).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="flex items-center gap-1 bg-blue-50"
                  >
                    <span className="break-all max-w-[150px]">{tag}</span>
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
  );
};
