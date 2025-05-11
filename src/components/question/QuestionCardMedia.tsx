
import React from 'react';
import { Button } from "@/components/ui/button";
import { Media } from '@/types/survey';
import { Trash } from "lucide-react";
import QuestionMediaUpload from '../QuestionMediaUpload';

interface QuestionCardMediaProps {
  media?: Media;
  onMediaUpload: (file: File, type: 'image' | 'video') => void;
  onMediaRemove: () => void;
}

const QuestionCardMedia: React.FC<QuestionCardMediaProps> = ({
  media,
  onMediaUpload,
  onMediaRemove
}) => {
  return (
    <div className="space-y-3">
      <div className="border-t border-ice pt-3">
        <QuestionMediaUpload onFileSelected={onMediaUpload} />
        
        {media && (
          <div className="mt-3 p-3 border rounded-md bg-white relative">
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt="Question media" 
                className="max-h-40 object-contain mx-auto" 
              />
            ) : (
              <video 
                src={media.url} 
                controls 
                className="max-h-40 w-full" 
              />
            )}
            <Button 
              variant="destructive" 
              size="sm"
              className="absolute top-2 right-2"
              onClick={onMediaRemove}
            >
              <Trash size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCardMedia;
