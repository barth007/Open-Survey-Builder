
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface QuestionMediaUploadProps {
  onFileSelected: (file: File, type: 'image' | 'video') => void;
}

const QuestionMediaUpload: React.FC<QuestionMediaUploadProps> = ({ onFileSelected }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file, 'image');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file, 'video');
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={handleImageClick}
              className="flex-1 h-14 rounded-2xl border-border/40 bg-muted/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-bold gap-3 shadow-sm hover:shadow-primary/20"
            >
              <Image size={18} />
              <span>Add Image</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl border-border/40 font-bold text-xs py-2 px-4 shadow-2xl">
            <p>Upload an image or high-quality GIF</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={handleVideoClick}
              className="flex-1 h-14 rounded-2xl border-border/40 bg-muted/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-bold gap-3 shadow-sm hover:shadow-primary/20"
            >
              <Video size={18} />
              <span>Add Video</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl border-border/40 font-bold text-xs py-2 px-4 shadow-2xl">
            <p>Embed or upload a video demonstration</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
      />

      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoChange}
        accept="video/mp4,video/webm,video/ogg"
        className="hidden"
      />
    </div>
  );
};

export default QuestionMediaUpload;
