
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from "lucide-react";
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
  return (
    <Card 
      className={`border-ice cursor-pointer transition-colors ${isSelected ? 'border-blue-400 ring-1 ring-blue-300' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="border-b border-ice">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg break-words pr-2" style={{ maxWidth: 'calc(100% - 100px)', overflowWrap: 'break-word' }}>
            {item.question}
          </CardTitle>
          <ToggleGroup 
            type="single" 
            value={chartType} 
            onValueChange={(value) => {
              if (value) onChartTypeChange(item.questionId, value as "bar" | "pie");
            }}
          >
            <ToggleGroupItem value="bar">
              <BarChartIcon size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem value="pie">
              <PieChartIcon size={18} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-hidden">
        <div className="overflow-x-hidden">
          <ResponseChartRenderer 
            chartType={chartType} 
            data={item.responses} 
            isLikert={item.likert} 
          />
        </div>
        
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
              {item.responses.map((response) => (
                <TableRow key={response.answer}>
                  <TableCell className="break-words" style={{ maxWidth: '200px', overflowWrap: 'break-word' }}>
                    {response.answer}
                  </TableCell>
                  <TableCell>{response.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      {response.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
