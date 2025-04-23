
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check, Trash, GripVertical } from "lucide-react";
import QuestionTypeMenu from './QuestionTypeMenu';
import { Question, QuestionOption, QuestionType } from '@/types/survey';

interface QuestionCardProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  isDragging?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onQuestionChange,
  onDeleteQuestion,
  isDragging = false,
}) => {
  const [newOptionText, setNewOptionText] = useState('');

  const handleTextChange = (text: string) => {
    onQuestionChange({ ...question, text });
  };

  const handleTypeChange = (type: QuestionType) => {
    onQuestionChange({ ...question, type });
  };

  const handleRequiredChange = (isRequired: boolean) => {
    onQuestionChange({ ...question, isRequired });
  };

  const addOption = () => {
    if (newOptionText.trim() === '') return;
    
    const newOption: QuestionOption = {
      id: Date.now().toString(),
      text: newOptionText
    };
    
    onQuestionChange({
      ...question,
      options: [...question.options, newOption]
    });
    
    setNewOptionText('');
  };

  const deleteOption = (optionId: string) => {
    onQuestionChange({
      ...question,
      options: question.options.filter(option => option.id !== optionId)
    });
  };

  const updateOptionText = (optionId: string, text: string) => {
    onQuestionChange({
      ...question,
      options: question.options.map(option => 
        option.id === optionId ? { ...option, text } : option
      )
    });
  };

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <GripVertical className="cursor-grab text-gray-400" size={20} />
          <Input
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Question"
            className="flex-1"
          />
          <QuestionTypeMenu
            currentType={question.type}
            onTypeChange={handleTypeChange}
          />
        </div>

        <div className="mt-4">
          {question.type === 'text' && (
            <Input disabled placeholder="Text answer will appear here" className="bg-muted/50" />
          )}

          {question.type === 'multipleChoice' && (
            <div className="space-y-2">
              <RadioGroup>
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <RadioGroupItem value={option.id} id={option.id} disabled />
                    <Input 
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOption(option.id)}
                    >
                      <Trash size={16} className="text-gray-500" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Add option"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addOption();
                    }
                  }}
                />
                <Button onClick={addOption} size="sm" variant="outline">
                  <Check size={16} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {question.type === 'checkboxes' && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Checkbox disabled id={option.id} />
                  <Input 
                    value={option.text}
                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(option.id)}
                  >
                    <Trash size={16} className="text-gray-500" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Add option"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addOption();
                    }
                  }}
                />
                <Button onClick={addOption} size="sm" variant="outline">
                  <Check size={16} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-3">
        <div className="flex items-center gap-2">
          <Switch
            id={`required-${question.id}`}
            checked={question.isRequired}
            onCheckedChange={handleRequiredChange}
          />
          <Label htmlFor={`required-${question.id}`}>Required</Label>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDeleteQuestion(question.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
