
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { id: surveyId } = useParams();

  // Focus the title input when the component mounts if it's empty
  useEffect(() => {
    if (title === "Untitled Survey" && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [title]);

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
    
    // Update the document title immediately for better UX
    document.title = newTitle;
  };

  return (
    <Card className="w-full border-t-4 border-t-indigo-500 min-h-[120px]">
      <CardContent className="pt-6 pb-6 min-h-[120px]">
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Survey Title"
          className="text-2xl font-bold border-none px-0 focus-visible:ring-0 mb-2 w-full h-auto min-h-[40px]"
        />
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Survey Description"
          className="border-none resize-none px-0 focus-visible:ring-0 w-full min-h-[60px]"
          rows={3}
        />
      </CardContent>
    </Card>
  );
};

export default SurveyTitle;
