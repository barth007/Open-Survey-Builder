import React, { useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from 'react-router-dom';

interface SurveyTitleProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

const SurveyTitle: React.FC<SurveyTitleProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { id: surveyId } = useParams();

  useEffect(() => {
    if (title === "Untitled Survey" && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [title]);

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
    document.title = newTitle;
  };

  return (
    <div className="w-full rounded-[32px] border border-border/70 bg-background px-8 py-7 shadow-[0_10px_40px_rgba(15,15,15,0.05)]">
      <Input
        ref={titleInputRef}
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Survey Title"
        className="h-auto min-h-[44px] border-none bg-transparent px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Add a description or instructions for respondents..."
        className="mt-3 min-h-[56px] resize-none border-none bg-transparent px-0 text-base leading-7 text-muted-foreground shadow-none focus-visible:ring-0"
        rows={2}
      />
    </div>
  );
};

export default SurveyTitle;
