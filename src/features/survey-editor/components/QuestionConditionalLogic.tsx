
import React from 'react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Question, ConditionalLogic } from '@/types/survey';

interface QuestionConditionalLogicProps {
  question: Question;
  questions: Question[];
  conditionalLogicOpen: boolean;
  setConditionalLogicOpen: (open: boolean) => void;
  onConditionalLogicChange: (field: keyof ConditionalLogic, value: string) => void;
}

const QuestionConditionalLogic: React.FC<QuestionConditionalLogicProps> = ({
  question,
  questions,
  conditionalLogicOpen,
  setConditionalLogicOpen,
  onConditionalLogicChange
}) => {
  const availableQuestions = questions.filter(q => q.id !== question.id);
  
  const selectedDependentQuestion = question.conditionalLogic?.dependsOn 
    ? questions.find(q => q.id === question.conditionalLogic?.dependsOn)
    : undefined;

  const hasConditionalLogic = !!question.conditionalLogic?.dependsOn;
    
  return (
    <Collapsible open={conditionalLogicOpen} onOpenChange={setConditionalLogicOpen}>
      <div className="mb-4 p-3 bg-ice rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {question.conditionalLogic?.dependsOn && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
            <h4 className="text-sm font-medium">Conditional Logic</h4>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {conditionalLogicOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-2 w-full">
              <Label className="w-24 shrink-0">Show when</Label>
              <Select
                value={question.conditionalLogic?.dependsOn || 'none'}
                onValueChange={(value) =>
                  onConditionalLogicChange('dependsOn', value === 'none' ? '' : value)
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select question" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Always show</SelectItem>
                  {availableQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.text.substring(0, 30)}{q.text.length > 30 ? '...' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {question.conditionalLogic?.dependsOn && (
              <>
                <div className="flex items-center gap-2 w-full">
                  <Label className="w-24 shrink-0">Operator</Label>
                  <Select
                    value={question.conditionalLogic?.operator || 'equals'}
                    onValueChange={(value) => onConditionalLogicChange('operator', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="notEquals">Does not equal</SelectItem>
                      <SelectItem value="isAnswered">Is answered</SelectItem>
                      <SelectItem value="isNotAnswered">Is not answered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {['equals', 'notEquals'].includes(question.conditionalLogic?.operator || '') &&
                  selectedDependentQuestion && (
                    <div className="flex items-center gap-2 w-full">
                      <Label className="w-24 shrink-0">Value</Label>
                      <Select
                        value={question.conditionalLogic?.value || ''}
                        onValueChange={(value) => onConditionalLogicChange('value', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDependentQuestion.options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default QuestionConditionalLogic;
