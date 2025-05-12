
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

interface StatisticalInsightsProps {
  responseData: ResponseGroup;
}

export const StatisticalInsights: React.FC<StatisticalInsightsProps> = ({ responseData }) => {
  // Calculate basic statistics
  const totalResponses = responseData.responses.reduce((sum, r) => sum + r.count, 0);
  const uniqueAnswers = responseData.responses.length;
  
  // For likert scales, calculate mode (most common answer)
  const mode = responseData.likert ? 
    [...responseData.responses].sort((a, b) => b.count - a.count)[0]?.answer :
    null;

  // For likert scales, try to calculate median
  let median = null;
  if (responseData.likert && responseData.responses.length > 0) {
    const numericAnswers: number[] = [];
    
    // Transform verbal responses to numeric (assuming they're properly ordered)
    responseData.responses.forEach(response => {
      // Add each answer as many times as its count
      for (let i = 0; i < response.count; i++) {
        // Using the index in the array as the numeric value
        const index = responseData.responses.findIndex(r => r.answer === response.answer);
        numericAnswers.push(index + 1);
      }
    });
    
    // Sort numeric answers
    numericAnswers.sort((a, b) => a - b);
    
    // Calculate median
    if (numericAnswers.length % 2 === 0) {
      // Even number of responses
      const mid = numericAnswers.length / 2;
      const medianValue = (numericAnswers[mid - 1] + numericAnswers[mid]) / 2;
      
      // Map back to the answer text
      if (medianValue % 1 === 0) {
        // Whole number
        median = responseData.responses[medianValue - 1]?.answer;
      } else {
        // Fractional number, meaning it's between two values
        median = `Between "${responseData.responses[Math.floor(medianValue) - 1]?.answer}" and "${responseData.responses[Math.ceil(medianValue) - 1]?.answer}"`;
      }
    } else {
      // Odd number of responses
      const mid = Math.floor(numericAnswers.length / 2);
      median = responseData.responses[numericAnswers[mid] - 1]?.answer;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md border border-ice">
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 mr-2 text-blue-600" />
          <h4 className="font-medium text-sm">Statistical Summary</h4>
        </div>
        <div className="space-y-3 text-sm">
          <p className="flex justify-between">
            <span className="text-gray-500">Total responses:</span>
            <span className="font-medium">{totalResponses}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Unique answers:</span>
            <span className="font-medium">{uniqueAnswers}</span>
          </p>
          
          {responseData.likert && (
            <>
              <p className="flex justify-between">
                <span className="text-gray-500">Mode (most common):</span>
                <span className="font-medium">{mode || 'N/A'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Median:</span>
                <span className="font-medium">{median || 'N/A'}</span>
              </p>
            </>
          )}
        </div>
      </div>
      
      {responseData.likert && (
        <div className="bg-gray-50 p-4 rounded-md border border-ice">
          <h4 className="font-medium mb-3">Distribution Analysis</h4>
          <p className="text-sm text-gray-500">
            The distribution appears to be {responseData.responses.length > 3 ? 'multimodal' : 'unimodal'} with 
            {responseData.responses.some(r => r.percentage && r.percentage > 40) ? ' a dominant peak.' : ' no clear dominant answer.'}
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h5 className="font-medium text-sm mb-2">Quantitative Insights</h5>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Response trend:</span>{' '}
                {responseData.responses[0]?.count > responseData.responses[responseData.responses.length - 1]?.count ? 
                  'Skewed towards lower values' : 'Skewed towards higher values'}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Data spread:</span>{' '}
                {responseData.responses.some(r => r.percentage && r.percentage > 70) ? 
                  'Low variance (concentrated responses)' : 'High variance (distributed responses)'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
