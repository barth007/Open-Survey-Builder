
import React, { useRef, useState, useEffect } from 'react';
import { useClickContext } from '@/contexts/ClickContext';
import { v4 as uuidv4 } from 'uuid';

interface FigmaPrototypeEmbedProps {
  figmaUrl: string;
  questionId: string;
}

export const FigmaPrototypeEmbed: React.FC<FigmaPrototypeEmbedProps> = ({ figmaUrl, questionId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => uuidv4());
  const { addClick } = useClickContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackPosition, setFeedbackPosition] = useState({ x: 0, y: 0 });
  
  // Convert regular Figma URL to embed URL if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    
    // Extract the file key and node ID if present
    const figmaRegex = /figma\.com\/(file|proto)\/([a-zA-Z0-9]+)(?:\/.*)?$/;
    const match = url.match(figmaRegex);
    
    if (match) {
      const fileKey = match[2];
      return `https://www.figma.com/embed?embed_host=surveytool&url=https://www.figma.com/file/${fileKey}`;
    }
    
    return url;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Store click data
    addClick({
      x,
      y,
      questionId,
      sessionId,
      timestamp: Date.now()
    });
    
    // Show visual feedback
    setFeedbackPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 800);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video max-w-3xl mx-auto my-4 border border-gray-200 rounded-md overflow-hidden"
    >
      <iframe 
        src={getEmbedUrl(figmaUrl)}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Overlay div to capture clicks */}
      <div 
        className="absolute inset-0 cursor-pointer z-10"
        onClick={handleClick}
      />
      
      {/* Click feedback dot */}
      {showFeedback && (
        <div 
          className="absolute w-4 h-4 bg-red-500 rounded-full opacity-70 transition-opacity duration-800 animate-ping"
          style={{ 
            left: feedbackPosition.x - 8, 
            top: feedbackPosition.y - 8,
          }}
        />
      )}
    </div>
  );
};
