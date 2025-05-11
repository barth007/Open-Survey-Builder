
import React from 'react';

interface FigmaPrototypeEmbedProps {
  figmaUrl: string;
  questionId: string;
  inEditMode?: boolean;
}

export const FigmaPrototypeEmbed: React.FC<FigmaPrototypeEmbedProps> = ({ 
  figmaUrl, 
  questionId,
  inEditMode = false
}) => {
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-center">
      <p className="text-sm text-gray-600">
        View <a href={figmaUrl} target="_blank" rel="noopener noreferrer" className="text-abyss underline">Figma prototype</a>
      </p>
    </div>
  );
};
