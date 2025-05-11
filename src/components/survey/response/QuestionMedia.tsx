
import React from 'react';
import { ExternalLink, Upload } from "lucide-react";
import { Media } from '@/types/survey';
import { Input } from '@/components/ui/input';
import { HeatmapVisualization } from '@/components/survey/HeatmapVisualization';

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
        <div className="mb-4">
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-center mb-2">
            <p className="text-sm text-gray-600">
              Figma prototype is available for this question
            </p>
          </div>

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
