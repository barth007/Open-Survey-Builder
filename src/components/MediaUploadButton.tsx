
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface MediaUploadButtonProps {
  onFileSelected: (file: File) => void;
  type: 'image' | 'video' | 'gif';
}

const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ onFileSelected, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const getIcon = () => {
    if (type === 'image' || type === 'gif') {
      return <Image size={18} />;
    }
    return <Video size={18} />;
  };

  const getAccept = () => {
    switch (type) {
      case 'image':
        return 'image/png,image/jpeg,image/jpg,image/webp';
      case 'gif':
        return 'image/gif';
      case 'video':
        return 'video/mp4,video/webm,video/ogg';
      default:
        return '';
    }
  };

  const getTooltipText = () => {
    switch (type) {
      case 'image':
        return 'Upload Image';
      case 'gif':
        return 'Upload GIF';
      case 'video':
        return 'Upload Video';
      default:
        return 'Upload Media';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleClick}>
            {getIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAccept()}
        className="hidden"
      />
    </TooltipProvider>
  );
};

export default MediaUploadButton;
