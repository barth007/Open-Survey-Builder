
import React from 'react';
import { Database } from 'lucide-react';

export const EmptyAnalysisState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Database className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Select a group of answers to analyze</h3>
      <p className="text-gray-500 max-w-md">
        Click on a response card on the left to view detailed analysis and statistical insights
      </p>
    </div>
  );
};
