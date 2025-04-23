
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  // Focus the title input when the component mounts if it's empty
  useEffect(() => {
    if (title === "Untitled Survey" && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [title]);

  return (
    <Card className="mb-6 border-t-4 border-t-indigo-500">
      <CardContent className="pt-6">
        <Input
          ref={titleInputRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Survey Title"
          className="text-2xl font-bold border-none px-0 focus-visible:ring-0 mb-2"
        />
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Survey Description"
          className="border-none resize-none px-0 focus-visible:ring-0"
        />
      </CardContent>
    </Card>
  );
};

export default SurveyTitle;
