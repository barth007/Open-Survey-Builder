
import React, { useState } from 'react';
import { Scale } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

interface ScaleMappingProps {
  responseData: ResponseGroup;
}

interface ScaleValues {
  [key: string]: number;
}

export const ScaleMapping: React.FC<ScaleMappingProps> = ({ responseData }) => {
  const [scaleValues, setScaleValues] = useState<ScaleValues>(() => {
    // Initialize scale values with default mappings based on position
    const initialValues: ScaleValues = {};
    responseData.responses.forEach((response, index) => {
      initialValues[response.answer] = index + 1;
    });
    return initialValues;
  });

  const [initializing, setInitializing] = useState(true);

  const handleScaleValueChange = (answer: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setScaleValues(prev => ({
      ...prev,
      [answer]: numericValue
    }));
    
    // After first edit, turn off initializing mode
    if (initializing) {
      setInitializing(false);
    }
  };

  // Simple statistics based on numeric mappings
  const calculateWeightedAverage = () => {
    let totalWeightedSum = 0;
    let totalCount = 0;
    
    responseData.responses.forEach(response => {
      const numericValue = scaleValues[response.answer] || 0;
      totalWeightedSum += numericValue * response.count;
      totalCount += response.count;
    });
    
    return totalCount > 0 ? (totalWeightedSum / totalCount).toFixed(2) : 'N/A';
  };

  const resetToDefault = () => {
    // Reset to sequential values
    const defaultValues: ScaleValues = {};
    responseData.responses.forEach((response, index) => {
      defaultValues[response.answer] = index + 1;
    });
    setScaleValues(defaultValues);
    setInitializing(true);
  };

  const resetToCustom = () => {
    // Reset to a 0-100 scale spread evenly
    const customValues: ScaleValues = {};
    const step = 100 / (responseData.responses.length - 1 || 1);
    
    responseData.responses.forEach((response, index) => {
      customValues[response.answer] = Math.round(index * step);
    });
    
    setScaleValues(customValues);
    setInitializing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md border border-ice">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Scale className="h-4 w-4 mr-2 text-blue-600" />
            <h4 className="font-medium text-sm">Scale Value Mapping</h4>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              Sequential
            </Button>
            <Button variant="outline" size="sm" onClick={resetToCustom}>
              0-100 Scale
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Assign numeric values to each answer option to calculate statistics.
          {initializing && " Default values are assigned based on position."}
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Answer Option</TableHead>
              <TableHead>Numeric Value</TableHead>
              <TableHead>Responses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responseData.responses.map(response => (
              <TableRow key={response.answer}>
                <TableCell>{response.answer}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={scaleValues[response.answer] || 0}
                    onChange={(e) => handleScaleValueChange(response.answer, e.target.value)}
                    className="w-20 h-8"
                    min="0"
                    step="0.1"
                  />
                </TableCell>
                <TableCell>{response.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="font-medium mb-2">Calculated Statistics</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-sm text-gray-500">Weighted Average</div>
              <div className="text-lg font-semibold">{calculateWeightedAverage()}</div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-sm text-gray-500">Scale Range</div>
              <div className="text-lg font-semibold">
                {Math.min(...Object.values(scaleValues))} - {Math.max(...Object.values(scaleValues))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
