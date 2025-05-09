
import React, { useRef, useEffect, useState } from 'react';
import { useClickContext } from '@/contexts/ClickContext';
import h337 from 'heatmap.js';

interface HeatmapVisualizationProps {
  questionId: string;
  imageUrl: string; // URL to the prototype screenshot or thumbnail
}

export const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({ questionId, imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getClicksByQuestionId } = useClickContext();
  const [heatmapInstance, setHeatmapInstance] = useState<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
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
  }, []);
  
  // Update heatmap data when clicks or container size changes
  useEffect(() => {
    if (!heatmapInstance || containerSize.width === 0) return;
    
    const clicks = getClicksByQuestionId(questionId);
    
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
  
  return (
    <div className="relative w-full aspect-video max-w-3xl mx-auto my-4 border border-gray-200 rounded-md overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        {/* The heatmap will be rendered inside this div */}
        <img 
          src={imageUrl} 
          alt="Prototype screenshot" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: -1 }} 
        />
      </div>
    </div>
  );
};
