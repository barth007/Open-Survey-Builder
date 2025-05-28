
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link as LinkIcon } from "lucide-react";
import { GripVertical } from "lucide-react";

interface QuestionHeaderProps {
  text: string;
  description: string;
  figmaPrototypeUrl: string | undefined;
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
<div className="space-y-4 min-h-[fit-content]">
  {/* Title */}
  <div className="flex items-center gap-3">
    <GripVertical className="cursor-grab text-carbon" size={20} />
    <Input
      value={text}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder="Question"
      className="flex-1 border-ice focus-visible:ring-abyss"
    />
  </div>

  {/* Description */}
  <div>
    <Textarea
      value={description || ''}
      onChange={(e) => onDescriptionChange(e.target.value)}
      placeholder="Question description (optional)"
      className="w-full resize-none border-ice focus-visible:ring-abyss"
      rows={2}
    />
  </div>
  
  {/* Figma Prototype URL */}
  <div className="flex items-center gap-2">
    <LinkIcon size={16} className="text-gray-500" />
    <Input
      value={figmaPrototypeUrl || ''}
      onChange={(e) => onFigmaPrototypeUrlChange(e.target.value)}
      placeholder="Figma prototype URL (optional)"
      className="flex-1 border-ice focus-visible:ring-abyss"
    />
  </div>
</div>

  );
};

export default QuestionHeader;
