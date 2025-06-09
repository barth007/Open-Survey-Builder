
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, FileText, Archive } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResponseChartRenderer } from './ResponseChartRenderer';

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
  questionType: string;
  isOrphaned?: boolean;
}

interface ResponseCardItemProps {
  item: ResponseGroup;
  isSelected: boolean;
  chartType: 'bar' | 'pie';
  onChartTypeChange: (questionId: string, type: 'bar' | 'pie') => void;
  onClick: () => void;
}

export const ResponseCardItem: React.FC<ResponseCardItemProps> = ({
  item,
  isSelected,
  chartType,
  onChartTypeChange,
  onClick
}) => {
  // Check if this question type supports charts
  const supportsCharts = ['multipleChoice', 'checkboxes', 'likert5', 'likert7', 'likert10'].includes(item.questionType);
  const isOrphaned = item.isOrphaned;
  
  return (
    <Card 
      className={`border-ice cursor-pointer transition-colors ${
        isSelected ? 'border-blue-400 ring-1 ring-blue-300' : ''
      } ${isOrphaned ? 'bg-orange-50 border-orange-200' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="border-b border-ice">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 pr-2 flex-1 min-w-0">
            {isOrphaned && <Archive size={16} className="text-orange-500 flex-shrink-0" />}
            {!isOrphaned && item.questionType === 'text' && <FileText size={16} className="text-gray-500 flex-shrink-0" />}
            <CardTitle className={`text-lg break-words overflow-hidden text-ellipsis ${
              isOrphaned ? 'text-orange-700' : ''
            }`}>
              {item.question}
            </CardTitle>
          </div>
          {supportsCharts && !isOrphaned && (
            <ToggleGroup 
              type="single" 
              value={chartType} 
              onValueChange={(value) => {
                if (value) onChartTypeChange(item.questionId, value as "bar" | "pie");
              }}
              className="flex-shrink-0"
            >
              <ToggleGroupItem value="bar">
                <BarChartIcon size={18} />
              </ToggleGroupItem>
              <ToggleGroupItem value="pie">
                <PieChartIcon size={18} />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-sm capitalize ${isOrphaned ? 'text-orange-600' : 'text-gray-500'}`}>
            {isOrphaned ? 'archived' : item.questionType} • {item.responses.reduce((sum, r) => sum + r.count, 0)} responses
          </div>
          {isOrphaned && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-hidden">
        {supportsCharts && !isOrphaned ? (
          <div className="overflow-x-hidden">
            <ResponseChartRenderer 
              chartType={chartType} 
              data={item.responses} 
              isLikert={item.likert} 
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {isOrphaned ? (
              <>
                <Archive size={32} className="mx-auto mb-2 opacity-50 text-orange-400" />
                <p className="text-sm text-orange-600">Archived question data - view details in analysis panel</p>
              </>
            ) : (
              <>
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Text responses - view details in analysis panel</p>
              </>
            )}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Answer</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.responses.slice(0, 10).map((response, index) => (
                <TableRow key={`${response.answer}-${index}`}>
                  <TableCell className="break-words max-w-[200px]">
                    <div className="overflow-hidden text-ellipsis" title={response.answer}>
                      {response.answer}
                    </div>
                  </TableCell>
                  <TableCell>{response.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      isOrphaned 
                        ? "bg-orange-50 text-orange-800 border-orange-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }>
                      {response.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {item.responses.length > 10 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 text-sm">
                    ... and {item.responses.length - 10} more responses
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
