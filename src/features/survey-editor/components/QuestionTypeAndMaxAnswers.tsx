
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionType } from '@/types/survey';
import QuestionTypeMenu from './../../../components/QuestionTypeMenu';

interface QuestionTypeAndMaxAnswersProps {
  type: QuestionType;
  onTypeChange: (type: QuestionType) => void;
  maxSelections?: number;
  onMaxSelectionsChange: (value: string) => void;
  isMultipleType: boolean;
  optionsCount: number;
}

const QuestionTypeAndMaxAnswers: React.FC<QuestionTypeAndMaxAnswersProps> = ({
  type,
  onTypeChange,
  maxSelections,
  onMaxSelectionsChange,
  isMultipleType,
  optionsCount
}) => {
  const getMaxSelectionsOptions = () => {
    return Array.from({ length: optionsCount }, (_, i) => i + 1).map(num => ({
      value: num.toString(),
      label: num.toString()
    }));
  };

  return (
    <div className="border-t border-ice pt-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full">
          <QuestionTypeMenu
            currentType={type}
            onTypeChange={onTypeChange}
            className="w-full"
          />
        </div>
        <div className="w-full">
          <Select
            value={maxSelections?.toString() || "no-limit"}
            onValueChange={onMaxSelectionsChange}
            disabled={!isMultipleType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Max answers allowed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-limit">No limit</SelectItem>
              {getMaxSelectionsOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value} {parseInt(option.value) === 1 ? 'answer' : 'answers'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeAndMaxAnswers;
