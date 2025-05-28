import React, { useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="w-full border border-ice rounded-lg bg-white min-h-[160px] flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-6 px-6 flex-1">
        <div className="flex items-center gap-3">
          <GripVertical className="text-carbon" size={18} />
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Survey Title"
            className="text-xl font-bold border-none px-0 focus-visible:ring-0 w-full h-auto min-h-[40px]"
          />
        </div>

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
