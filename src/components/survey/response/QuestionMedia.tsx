
import React from 'react';
import { Link } from "lucide-react";
import { Media } from '@/types/survey';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';

interface QuestionMediaProps {
  media?: Media;
  figmaPrototypeUrl?: string;
  questionId?: string;
  isAnswersTab?: boolean;
  figmaScreenshot?: string;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({ 
  media, 
  figmaPrototypeUrl, 
  questionId = "",
  isAnswersTab = false,
  figmaScreenshot = "" 
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

      {figmaPrototypeUrl && !isAnswersTab && (
        <div className="mb-4">
          <FigmaPrototypeEmbed 
            figmaUrl={figmaPrototypeUrl}
            questionId={questionId}
          />
        </div>
      )}

      {figmaPrototypeUrl && !isAnswersTab && (
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

      {figmaPrototypeUrl && isAnswersTab && figmaScreenshot && (
        <div className="mb-4">
          <div className="font-medium mb-2">Figma Prototype Heatmap</div>
          <HeatmapVisualization 
            questionId={questionId}
            imageUrl={figmaScreenshot}
          />
        </div>
      )}
    </>
  );
};
