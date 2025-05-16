
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

interface ResponseTagItemProps {
  response: ResponseData;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const ResponseTagItem: React.FC<ResponseTagItemProps> = ({ 
  response, 
  tags, 
  onAddTag, 
  onRemoveTag 
}) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    onAddTag(newTag.trim());
    setNewTag("");
  };

  return (
    <div className="border-b border-gray-100 pb-3">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium break-words pr-2" style={{ maxWidth: '70%', overflowWrap: 'break-word' }}>
          {response.answer}
        </span>
        <span className="text-sm text-gray-500 whitespace-nowrap">{response.count} responses</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="flex items-center gap-1 bg-blue-50"
          >
            <span className="break-all max-w-[150px]">{tag}</span>
            <button 
              className="ml-1 text-gray-500 hover:text-red-500"
              onClick={() => onRemoveTag(tag)}
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
            if (e.key === 'Enter') handleAddTag();
          }}
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAddTag}
          className="h-8"
        >
          Add
        </Button>
      </div>
    </div>
  );
};
