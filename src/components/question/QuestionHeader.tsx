
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface QuestionHeaderProps {
  text: string;
  description: string;
  figmaPrototypeUrl?: string;
  onTextChange: (text: string) => void;
  onDescriptionChange: (description: string) => void;
  onFigmaPrototypeUrlChange: (url: string) => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  text,
  description,
  figmaPrototypeUrl,
  onTextChange,
  onDescriptionChange,
  onFigmaPrototypeUrlChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-text">Question</Label>
        <Input
          id="question-text"
          placeholder="Enter your question here..."
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="question-description">Description (optional)</Label>
        <Textarea
          id="question-description"
          placeholder="Add additional context or instructions..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="w-full resize-none"
        />
      </div>

      {figmaPrototypeUrl !== undefined && (
        <div className="space-y-2">
          <Label htmlFor="figma-url">Figma Prototype URL (optional)</Label>
          <Input
            id="figma-url"
            placeholder="https://www.figma.com/proto/..."
            value={figmaPrototypeUrl || ''}
            onChange={(e) => onFigmaPrototypeUrlChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionHeader;
