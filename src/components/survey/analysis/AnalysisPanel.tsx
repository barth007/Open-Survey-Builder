
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Filter, Tag } from "lucide-react";

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

interface AnalysisPanelProps {
  selectedResponseGroup: string | null;
  responseData: ResponseGroup | null;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  selectedResponseGroup,
  responseData
}) => {
  return (
    <Card className="h-full border-ice">
      <CardHeader className="border-b border-ice">
        <CardTitle className="text-lg">Analysis Panel</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!selectedResponseGroup ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Database className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a group of answers to analyze</h3>
            <p className="text-gray-500 max-w-md">
              Click on a response card on the left to view detailed analysis and statistical insights
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-carbon">
              {responseData?.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md border border-ice">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 mr-2 text-blue-600" />
                  <h4 className="font-medium text-sm">Statistical Summary</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Total responses:</span>
                    <span className="font-medium">{responseData?.responses.reduce((sum, r) => sum + r.count, 0) || 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Unique answers:</span>
                    <span className="font-medium">{responseData?.responses.length || 0}</span>
                  </p>
                  {responseData?.likert && (
                    <>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Median:</span>
                        <span className="font-medium">Coming soon</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Mode:</span>
                        <span className="font-medium">Coming soon</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-ice">
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-2 text-blue-600" />
                  <h4 className="font-medium text-sm">Tagging</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Tag functionality will allow grouping and categorizing of responses for deeper analysis.
                </p>
              </div>
            </div>

            {responseData?.likert && (
              <div className="border-t border-ice pt-4">
                <h4 className="font-medium mb-3">Likert Scale Insights</h4>
                <div className="bg-gray-50 p-4 rounded-md border border-ice">
                  <p className="text-sm text-gray-500 mb-3">
                    Additional statistical analysis for Likert scale responses will be available in future updates:
                  </p>
                  <ul className="text-sm space-y-2 list-disc pl-4 text-gray-600">
                    <li>Normality testing</li>
                    <li>Interquartile range (IQR) analysis</li>
                    <li>Correlation with other questions</li>
                    <li>Outlier detection</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="pt-4 text-sm text-gray-500">
              <p>
                This analysis panel will be expanded with more tools in future updates.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
