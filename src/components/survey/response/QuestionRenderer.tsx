
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionRendererProps {
  question: Question;
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answers,
  onAnswerChange
}) => {
  const handleCheckboxChange = (questionId: string, optionId: string) => {
    const currentAnswers = answers[questionId] as string[] || [];
    
    // Find the specific question to get maxSelections
    const maxSelections = question.maxSelections;
    
    if (currentAnswers.includes(optionId)) {
      onAnswerChange(
        questionId, 
        currentAnswers.filter(id => id !== optionId)
      );
      return;
    }
    
    if (maxSelections === 1) {
      onAnswerChange(questionId, [optionId]);
      return;
    }
    
    if (maxSelections && currentAnswers.length >= maxSelections) {
      return;
    }
    
    onAnswerChange(
      questionId,
      [...currentAnswers, optionId]
    );
  };

  const handleRadioChange = (questionId: string, optionId: string) => {
    onAnswerChange(questionId, optionId);
  };

  const handleTextChange = (questionId: string, value: string) => {
    onAnswerChange(questionId, value);
  };

  switch(question.type) {
    case 'text':
      return (
        <input 
          type="text" 
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-abyss"
          placeholder="Your answer"
          value={(answers[question.id] as string) || ''}
          onChange={(e) => handleTextChange(question.id, e.target.value)}
        />
      );
    
    case 'multipleChoice':
      return (
        <div className="space-y-2">
          <RadioGroup 
            name={`question-${question.id}`} 
            value={answers[question.id] as string}
            onValueChange={(value) => handleRadioChange(question.id, value)}
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={option.id}
                  id={`response-${option.id}`}
                  className="mt-1"
                />
                <div>
                  <label htmlFor={`response-${option.id}`} className="text-md text-carbon">{option.text}</label>
                  {option.media && (
                    <div className="mt-2">
                      {option.media.type === 'image' || option.media.type === 'gif' ? (
                        <img 
                          src={option.media.url} 
                          alt={option.text} 
                          className="max-h-32 object-contain rounded-md" 
                        />
                      ) : (
                        <video 
                          src={option.media.url} 
                          controls 
                          className="max-h-32 w-full rounded-md"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    
    case 'checkboxes':
      const currentSelections = (answers[question.id] as string[]) || [];
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <Checkbox
                id={`response-${option.id}`}
                checked={currentSelections.includes(option.id)}
                onCheckedChange={() => handleCheckboxChange(question.id, option.id)}
                className="mt-1"
              />
              <div>
                <label htmlFor={`response-${option.id}`} className="text-md text-carbon">{option.text}</label>
                {option.media && (
                  <div className="mt-2">
                    {option.media.type === 'image' || option.media.type === 'gif' ? (
                      <img 
                        src={option.media.url} 
                        alt={option.text} 
                        className="max-h-32 object-contain rounded-md" 
                      />
                    ) : (
                      <video 
                        src={option.media.url} 
                        controls 
                        className="max-h-32 w-full rounded-md"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
      
    case 'likert5':
    case 'likert7':
    case 'likert10':
      const labels = question.options.map(opt => opt.text);
      const columns = labels.length;
      const gridClass = `grid grid-cols-${columns < 5 ? columns : 5} md:grid-cols-${columns} gap-1`;
      
      return (
        <div className="mt-4">
          <RadioGroup 
            name={`likert-${question.id}`}
            value={answers[question.id] as string}
            onValueChange={(value) => handleRadioChange(question.id, value)}
          >
            <div className={gridClass}>
              {question.options.map((option, i) => (
                <div key={option.id} className="flex flex-col items-center">
                  <RadioGroupItem
                    value={option.id}
                    id={`likert-${option.id}`}
                    className="mx-auto"
                  />
                  <label 
                    htmlFor={`likert-${option.id}`}
                    className="text-xs text-center mt-1"
                  >
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    
    default:
      return null;
  }
};
