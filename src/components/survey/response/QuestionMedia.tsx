
import React from 'react';
import { Link } from "lucide-react";
import { Media } from '@/types/survey';

interface QuestionMediaProps {
  media?: Media;
  figmaPrototypeUrl?: string;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({ media, figmaPrototypeUrl }) => {
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

      {figmaPrototypeUrl && (
        <div className="mb-4">
          <a 
            href={figmaPrototypeUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-abyss underline flex items-center gap-1"
          >
            <Link size={14} /> View Figma prototype
          </a>
        </div>
      )}
    </>
  );
};
