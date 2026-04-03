
import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

interface ResponseGroup {
  questionId: string;
  question: string;
  responses: ResponseData[];
  likert: boolean;
}

interface OutlierDetectionProps {
  responseData: ResponseGroup;
}

export const OutlierDetection: React.FC<OutlierDetectionProps> = ({ responseData }) => {
  const [threshold, setThreshold] = useState(15); // Default threshold percentage
  const [excludedResponses, setExcludedResponses] = useState<string[]>([]);
  
  // Calculate total responses after exclusions
  const filteredResponses = responseData.responses.filter(
    response => !excludedResponses.includes(response.answer)
  );
  
  const totalResponsesAfterExclusion = filteredResponses.reduce(
    (sum, response) => sum + response.count, 0
  );
  
  // Recalculate percentages after exclusions
  const recalculatedResponses = filteredResponses.map(response => ({
    ...response,
    adjustedPercentage: Math.round((response.count / totalResponsesAfterExclusion) * 100)
  }));
  
  // Detect potential outliers based on threshold
  const outliers = responseData.responses.filter(
    response => 
      (response.percentage || 0) < threshold && 
      !excludedResponses.includes(response.answer)
  );
  
  // Toggle exclusion for a response
  const toggleExclusion = (answer: string) => {
    if (excludedResponses.includes(answer)) {
      setExcludedResponses(excludedResponses.filter(r => r !== answer));
    } else {
      setExcludedResponses([...excludedResponses, answer]);
    }
  };
  
  // Reset all exclusions
  const resetExclusions = () => {
    setExcludedResponses([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md border border-ice">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
          <h4 className="font-medium text-sm">Outlier Detection & Removal</h4>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Identify and exclude low-frequency responses that may skew your analysis.
        </p>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Outlier Threshold (%)</span>
            <span className="text-sm font-medium">{threshold}%</span>
          </div>
          <Slider
            value={[threshold]}
            onValueChange={(values) => setThreshold(values[0])}
            min={1}
            max={30}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>More Selective</span>
            <span>Less Selective</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <h5 className="text-sm font-medium">Potential Outliers</h5>
            <span className="text-xs text-gray-500">
              {outliers.length} detected below {threshold}% threshold
            </span>
          </div>
          
          {outliers.length > 0 ? (
            <div className="space-y-2">
              {outliers.map(outlier => (
                <div key={outlier.answer} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                  <div>
                    <span className="text-sm font-medium mr-2">{outlier.answer}</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                      {outlier.percentage}%
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleExclusion(outlier.answer)}
                    className={excludedResponses.includes(outlier.answer) ? "text-red-500" : "text-gray-500"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-white p-3 rounded border border-gray-200">
              No outliers detected with current threshold
            </div>
          )}
        </div>
        
        {excludedResponses.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <h5 className="text-sm font-medium">Excluded Responses</h5>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetExclusions}
                className="text-gray-500 h-6 text-xs"
              >
                Reset All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {excludedResponses.map(answer => (
                <Badge 
                  key={answer} 
                  variant="secondary"
                  className="flex items-center gap-1 bg-red-50 text-red-800 border-red-200"
                >
                  {answer}
                  <button 
                    className="ml-1 text-red-500"
                    onClick={() => toggleExclusion(answer)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {excludedResponses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h5 className="text-sm font-medium mb-2">Recalculated Distribution After Exclusions</h5>
            <div className="space-y-3">
              {recalculatedResponses.map(response => (
                <div key={response.answer} className="flex justify-between items-center">
                  <span className="text-sm">{response.answer}</span>
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500 w-24 text-right">
                      Before: {response.percentage}%
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      Now: {response.adjustedPercentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
