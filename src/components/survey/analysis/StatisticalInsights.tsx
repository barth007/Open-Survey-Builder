
import React from 'react';
import { Filter } from "lucide-react";

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

interface ScaleValues {
  [key: string]: number;
}

interface StatisticalInsightsProps {
  responseData: ResponseGroup;
  scaleValues?: ScaleValues;
}

export const StatisticalInsights: React.FC<StatisticalInsightsProps> = ({ 
  responseData, 
  scaleValues 
}) => {
  // Calculate basic statistics
  const totalResponses = responseData.responses.reduce((sum, r) => sum + r.count, 0);
  const uniqueAnswers = responseData.responses.length;
  
  // For likert scales, calculate mode (most common answer)
  const mode = responseData.likert ? 
    [...responseData.responses].sort((a, b) => b.count - a.count)[0]?.answer :
    null;

  // Calculate weighted average using custom scale values
  const calculateWeightedAverage = () => {
    if (!responseData.likert || !scaleValues) return null;
    
    let totalWeightedSum = 0;
    let totalCount = 0;
    
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer] || 0;
      totalWeightedSum += numericValue * response.count;
      totalCount += response.count;
    });
    
    return totalCount > 0 ? (totalWeightedSum / totalCount).toFixed(2) : null;
  };

  // Calculate median using custom scale values
  const calculateMedian = () => {
    if (!responseData.likert || !scaleValues) return null;
    
    const numericAnswers: number[] = [];
    
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer];
      if (numericValue !== undefined) {
        for (let i = 0; i < response.count; i++) {
          numericAnswers.push(numericValue);
        }
      }
    });
    
    if (numericAnswers.length === 0) return null;
    
    numericAnswers.sort((a, b) => a - b);
    
    let medianValue: number;
    if (numericAnswers.length % 2 === 0) {
      const mid = numericAnswers.length / 2;
      medianValue = (numericAnswers[mid - 1] + numericAnswers[mid]) / 2;
    } else {
      const mid = Math.floor(numericAnswers.length / 2);
      medianValue = numericAnswers[mid];
    }
    
    // Find the answer closest to the median value
    let closestAnswer = responseData.responses[0]?.answer;
    let closestDiff = Infinity;
    
    responseData.responses.forEach(response => {
      const value = scaleValues[response.answer];
      if (value !== undefined) {
        const diff = Math.abs(value - medianValue);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestAnswer = response.answer;
        }
      }
    });
    
    return closestAnswer;
  };

  // Analyze distribution trend using custom scale values
  const analyzeTrend = () => {
    if (!responseData.likert || !scaleValues) return 'N/A';
    
    const weightedAvg = parseFloat(calculateWeightedAverage() || '0');
    const scaleRange = Object.values(scaleValues);
    const minScale = Math.min(...scaleRange);
    const maxScale = Math.max(...scaleRange);
    const midpoint = (minScale + maxScale) / 2;
    
    if (weightedAvg > midpoint + (maxScale - minScale) * 0.15) {
      return 'Skewed towards higher values';
    } else if (weightedAvg < midpoint - (maxScale - minScale) * 0.15) {
      return 'Skewed towards lower values';
    } else {
      return 'Centered distribution';
    }
  };

  // Calculate variance interpretation
  const analyzeVariance = () => {
    if (!responseData.likert || !scaleValues) return 'N/A';
    
    const weightedAvg = parseFloat(calculateWeightedAverage() || '0');
    let variance = 0;
    let totalCount = 0;
    
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer];
      if (numericValue !== undefined) {
        variance += response.count * Math.pow(numericValue - weightedAvg, 2);
        totalCount += response.count;
      }
    });
    
    variance = variance / totalCount;
    const standardDeviation = Math.sqrt(variance);
    
    const scaleRange = Math.max(...Object.values(scaleValues)) - Math.min(...Object.values(scaleValues));
    const relativeSD = standardDeviation / scaleRange;
    
    if (relativeSD < 0.2) {
      return 'Low variance (concentrated responses)';
    } else if (relativeSD > 0.4) {
      return 'High variance (distributed responses)';
    } else {
      return 'Moderate variance';
    }
  };

  const weightedAverage = calculateWeightedAverage();
  const median = calculateMedian();
  
  return (
    <div className="space-y-6" role="region" aria-label="Statistical analysis">
      <div className="bg-gray-50 p-4 rounded-md border border-ice">
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
          <h4 className="font-medium text-sm">Statistical Summary</h4>
        </div>
        <div className="space-y-3 text-sm" role="list" aria-label="Basic statistics">
          <p className="flex justify-between" role="listitem">
            <span className="text-gray-500">Total responses:</span>
            <span 
              className="font-medium" 
              aria-label={`Total responses: ${totalResponses}`}
            >
              {totalResponses}
            </span>
          </p>
          <p className="flex justify-between" role="listitem">
            <span className="text-gray-500">Unique answers:</span>
            <span 
              className="font-medium"
              aria-label={`Unique answers: ${uniqueAnswers}`}
            >
              {uniqueAnswers}
            </span>
          </p>
          
          {responseData.likert && (
            <>
              <p className="flex justify-between" role="listitem">
                <span className="text-gray-500">Mode (most common):</span>
                <span 
                  className="font-medium"
                  aria-label={`Most common response: ${mode || 'Not available'}`}
                >
                  {mode || 'N/A'}
                </span>
              </p>
              {median && (
                <p className="flex justify-between" role="listitem">
                  <span className="text-gray-500">Median:</span>
                  <span 
                    className="font-medium"
                    aria-label={`Median response: ${median}`}
                  >
                    {median}
                  </span>
                </p>
              )}
              {weightedAverage && (
                <p className="flex justify-between" role="listitem">
                  <span className="text-gray-500">Weighted average:</span>
                  <span 
                    className="font-medium"
                    aria-label={`Weighted average score: ${weightedAverage}`}
                  >
                    {weightedAverage}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {responseData.likert && scaleValues && (
        <div className="bg-gray-50 p-4 rounded-md border border-ice">
          <h4 className="font-medium mb-3">Distribution Analysis</h4>
          
          <div className="space-y-2" role="list" aria-label="Distribution analysis">
            <p className="text-sm" role="listitem">
              <span className="text-gray-500">Response trend:</span>{' '}
              <span 
                className="font-medium"
                aria-label={`Response trend: ${analyzeTrend()}`}
              >
                {analyzeTrend()}
              </span>
            </p>
            <p className="text-sm" role="listitem">
              <span className="text-gray-500">Data spread:</span>{' '}
              <span 
                className="font-medium"
                aria-label={`Data spread: ${analyzeVariance()}`}
              >
                {analyzeVariance()}
              </span>
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h5 className="font-medium text-sm mb-2">Scale Information</h5>
            <div className="space-y-1 text-sm" role="list" aria-label="Scale configuration">
              <p role="listitem">
                <span className="text-gray-500">Scale range:</span>{' '}
                <span 
                  aria-label={`Scale range from ${Math.min(...Object.values(scaleValues))} to ${Math.max(...Object.values(scaleValues))}`}
                >
                  {Math.min(...Object.values(scaleValues))} - {Math.max(...Object.values(scaleValues))}
                </span>
              </p>
              <p role="listitem">
                <span className="text-gray-500">Custom mapping:</span>{' '}
                <span 
                  aria-label={`${Object.keys(scaleValues).length} levels configured in custom mapping`}
                >
                  {Object.keys(scaleValues).length} levels configured
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
