
import React, { useRef, useEffect, useState } from 'react';
import { useClickContext } from '@/contexts/ClickContext';
import { Download } from 'lucide-react';
import h337 from 'heatmap.js';
import { Button } from '@/components/ui/button';

interface HeatmapVisualizationProps {
  questionId: string;
  imageUrl: string; // URL to the prototype screenshot or thumbnail
}

export const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({ questionId, imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getClicksByQuestionId } = useClickContext();
  const [heatmapInstance, setHeatmapInstance] = useState<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [clickCount, setClickCount] = useState(0);
  
  // Initialize heatmap once the container is mounted
  useEffect(() => {
    if (!containerRef.current) return;
    
    const config = {
      container: containerRef.current,
      radius: 30,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75
    };
    
    const heatmapInstance = h337.create(config);
    setHeatmapInstance(heatmapInstance);
    
    // Get container dimensions
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ width, height });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Update heatmap data when clicks or container size changes
  useEffect(() => {
    if (!heatmapInstance || containerSize.width === 0) return;
    
    const clicks = getClicksByQuestionId(questionId);
    setClickCount(clicks.length);
    
    // Convert relative coordinates to pixel values
    const points = clicks.map(click => ({
      x: Math.floor(click.x * containerSize.width),
      y: Math.floor(click.y * containerSize.height),
      value: 1
    }));
    
    heatmapInstance.setData({
      max: Math.max(1, clicks.length / 5), // Adjust max based on click count
      data: points
    });
  }, [questionId, heatmapInstance, containerSize, getClicksByQuestionId]);
  
  // Download heatmap as image
  const downloadHeatmap = () => {
    if (!containerRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    
    // Draw background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Draw prototype image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw heatmap canvas on top
      const heatmapCanvas = containerRef.current?.querySelector('canvas');
      if (heatmapCanvas) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(heatmapCanvas, 0, 0, canvas.width, canvas.height);
      }
      
      // Create download link
      const link = document.createElement('a');
      link.download = `heatmap-${questionId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = imageUrl;
  };
  
  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-video max-w-3xl mx-auto border border-gray-200 rounded-md overflow-hidden">
        <div ref={containerRef} className="absolute inset-0">
          <img 
            src={imageUrl} 
            alt="Prototype screenshot" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: -1 }} 
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {clickCount} total clicks recorded on this prototype
        </p>
        <Button variant="outline" size="sm" onClick={downloadHeatmap}>
          <Download size={14} className="mr-1" /> Download Heatmap
        </Button>
      </div>
    </div>
  );
};
