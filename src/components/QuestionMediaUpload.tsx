
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
              size="sm" 
              onClick={handleImageClick} 
              className="flex-1"
            >
              <Image size={16} className="mr-2" />
              Add Image
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload an image or GIF</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleVideoClick} 
              className="flex-1"
            >
              <Video size={16} className="mr-2" />
              Add Video
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload a video</p>
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
