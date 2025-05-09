
import React, { useState } from 'react';
import { Link, ExternalLink, Upload } from "lucide-react";
import { Media } from '@/types/survey';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { HeatmapVisualization } from '@/components/survey/HeatmapVisualization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuestionMediaProps {
  media?: Media;
  figmaPrototypeUrl?: string;
  questionId?: string;
  isAnswersTab?: boolean;
  figmaScreenshot?: string;
  inEditMode?: boolean;
  onScreenshotUpload?: (file: File) => void;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({ 
  media, 
  figmaPrototypeUrl, 
  questionId = "",
  isAnswersTab = false,
  figmaScreenshot = "",
  inEditMode = false,
  onScreenshotUpload
}) => {
  const [showPrototype, setShowPrototype] = useState(true);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onScreenshotUpload) {
      onScreenshotUpload(file);
    }
  };

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
        <>
          {showPrototype ? (
            <div className="mb-4">
              <FigmaPrototypeEmbed 
                figmaUrl={figmaPrototypeUrl}
                questionId={questionId}
                inEditMode={inEditMode}
              />
              {inEditMode && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Preview only - click tracking is disabled in edit mode. Click interactions will be recorded in the live survey.</p>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="mb-4 border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
              onClick={() => setShowPrototype(true)}
            >
              <p className="text-muted-foreground">Click to load Figma prototype</p>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <a 
              href={figmaPrototypeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-abyss underline flex items-center gap-1"
            >
              <ExternalLink size={14} /> View Figma prototype
            </a>
            
            {inEditMode && onScreenshotUpload && (
              <div className="relative">
                <Input
                  type="file"
                  id={`screenshot-${questionId}`}
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
                <label 
                  htmlFor={`screenshot-${questionId}`} 
                  className="text-sm text-abyss underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={14} /> Upload screenshot for heatmap
                </label>
              </div>
            )}
          </div>
        </>
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
