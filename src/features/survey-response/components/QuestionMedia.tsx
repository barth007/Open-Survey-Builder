
import React from 'react';
import { Media } from '@/types/survey';

interface QuestionMediaProps {
  media?: Media;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({ 
  media
}) => {
  return (
    <>
      {media && (
        <div className="mb-4 mt-2">
          {media.type === 'image' || media.type === 'gif' ? (
            <img 
              src={media.url} 
              alt="Question media" 
              className="max-h-48 object-contain rounded-md" 
            />
          ) : (
            <video 
              src={media.url} 
              controls 
              className="max-h-48 w-full rounded-md"
            />
          )}
        </div>
      )}
    </>
  );
};
