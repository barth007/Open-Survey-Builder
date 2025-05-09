
import React, { useState } from 'react';
import { Link, ExternalLink, Upload, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FigmaPrototypeEmbed } from '../survey/response/FigmaPrototypeEmbed';
import { toast } from '@/components/ui/sonner';

interface FigmaPrototypePreviewProps {
  figmaUrl: string;
  questionId: string;
  onFigmaUrlSave: (url: string) => void;
  onScreenshotUpload?: (file: File) => void;
  hasScreenshot?: boolean;
}

export const FigmaPrototypePreview: React.FC<FigmaPrototypePreviewProps> = ({
  figmaUrl,
  questionId,
  onFigmaUrlSave,
  onScreenshotUpload,
  hasScreenshot = false
}) => {
  const [url, setUrl] = useState(figmaUrl || '');
  const [isEditing, setIsEditing] = useState(!figmaUrl);
  const [showPreview, setShowPreview] = useState(!!figmaUrl);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSave = () => {
    if (!url) {
      setIsEditing(false);
      return;
    }

    // Basic validation for Figma URL
    const figmaRegex = /figma\.com\/(file|proto)\/([a-zA-Z0-9]+)(?:\/.*)?$/;
    if (!figmaRegex.test(url)) {
      toast({
        title: "Invalid Figma URL",
        description: "Please enter a valid Figma prototype or file URL",
        variant: "destructive"
      });
      return;
    }

    onFigmaUrlSave(url);
    setIsEditing(false);
    setShowPreview(true);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onScreenshotUpload) {
      onScreenshotUpload(file);
      toast({
        title: "Screenshot uploaded",
        description: "The prototype screenshot has been uploaded successfully"
      });
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-4 my-4 border-t border-ice pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Figma Prototype</h3>
        <Button 
          variant="ghost"
          size="sm"
          onClick={toggleEdit}
        >
          {isEditing ? "Cancel" : "Edit URL"}
        </Button>
      </div>

      {isEditing ? (
        <div className="flex gap-2 items-center">
          <Link size={16} className="text-abyss shrink-0" />
          <Input
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter Figma prototype URL (e.g., https://www.figma.com/proto/...)"
            className="flex-1 text-sm border-ice"
          />
          <Button 
            onClick={handleSave} 
            size="sm" 
            variant="outline"
            className="border-abyss text-abyss hover:bg-abyss hover:text-white"
          >
            <Check size={16} className="mr-1" />
            Save
          </Button>
        </div>
      ) : showPreview ? (
        <div>
          <FigmaPrototypeEmbed 
            figmaUrl={figmaUrl}
            questionId={questionId}
            inEditMode={true}
          />
          
          <div className="flex flex-wrap gap-3 mt-3">
            <a 
              href={figmaUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-abyss underline flex items-center gap-1"
            >
              <ExternalLink size={14} /> Open in Figma
            </a>

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
                <Upload size={14} /> 
                {hasScreenshot 
                  ? "Replace heatmap screenshot" 
                  : "Upload heatmap screenshot"}
              </label>
            </div>
            
            {hasScreenshot && (
              <span className="text-xs text-green-600 flex items-center">
                <Check size={12} className="mr-1" /> Screenshot uploaded
              </span>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="border border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <p className="text-muted-foreground">Click to preview Figma prototype</p>
        </div>
      )}
    </div>
  );
};
