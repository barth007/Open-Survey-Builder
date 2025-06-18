
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SurveyResponse } from '@/types/survey';

interface SummaryCardProps {
  responses: SurveyResponse[] | undefined;
  onExportCSV: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ responses, onExportCSV }) => {
  const totalResponses = responses?.length || 0;
  const lastResponseDate = responses && responses.length > 0 
    ? new Date(responses[responses.length - 1].submittedAt).toLocaleString() 
    : 'No responses yet';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ice p-6 mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2 text-carbon">Response Summary</h2>
          <p className="text-gray-600 mb-2">Total responses: <span className="font-medium">{totalResponses}</span></p>
          <p className="text-gray-600">Last response: <span className="font-medium">{lastResponseDate}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onExportCSV} 
            variant="outline" 
            className="flex gap-2"
            disabled={!responses || responses.length === 0}
          >
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
