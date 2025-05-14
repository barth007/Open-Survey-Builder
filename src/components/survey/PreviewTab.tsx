
import React, { useState } from 'react';
import { Question, Survey } from '@/types/survey';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { getGridColumns } from '@/lib/utils';

interface PreviewTabProps {
  survey: Survey;
}

const PreviewTab: React.FC<PreviewTabProps> = ({ survey }) => {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const isMobile = useIsMobile();

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic || !question.conditionalLogic.dependsOn) return true;
    
    const { dependsOn, operator, value } = question.conditionalLogic;
    const answer = answers[dependsOn];
    
    console.log('Conditional logic check:', {
      questionId: question.id,
      dependsOn,
      operator,
      expectedValue: value,
      actualAnswer: answer,
      answerType: Array.isArray(answer) ? 'array' : typeof answer
    });

    const dependentQuestion = survey.questions.find(q => q.id === dependsOn);
    if (!dependentQuestion) return true;

    switch (operator) {
      case 'equals':
        if (Array.isArray(answer)) {
          return answer.includes(value as string);
        }
        return answer === value;
      case 'notEquals':
        if (Array.isArray(answer)) {
          return !answer.includes(value as string);
        }
        return answer !== value;
      case 'isAnswered':
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer !== undefined && answer !== '';
      case 'isNotAnswered':
        if (Array.isArray(answer)) {
          return answer.length === 0;
        }
        return answer === undefined || answer === '';
      default:
        return true;
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    console.log('Answer updated:', { questionId, value, allAnswers: {...answers, [questionId]: value} });
  };

  const handleCheckboxChange = (questionId: string, optionId: string) => {
    const currentAnswers = answers[questionId] as string[] || [];
    const maxSelections = survey.questions.find(q => q.id === questionId)?.maxSelections;
    
    if (currentAnswers.includes(optionId)) {
      handleAnswerChange(
        questionId, 
        currentAnswers.filter(id => id !== optionId)
      );
      return;
    }
    
    if (maxSelections === 1) {
      handleAnswerChange(questionId, [optionId]);
      return;
    }
    
    if (maxSelections && currentAnswers.length >= maxSelections) {
      return;
    }
    
    handleAnswerChange(
      questionId,
      [...currentAnswers, optionId]
    );
  };

  const handleRadioChange = (questionId: string, optionId: string) => {
    handleAnswerChange(questionId, optionId);
  };

  const renderQuestionInput = (question: Question) => {
    if (!isQuestionVisible(question)) return null;

    switch(question.type) {
      case 'text':
        return (
          <input 
            type="text" 
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-abyss" 
            placeholder="Your answer"
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
                <div key={option.id} className="flex items-start">
                  <RadioGroupItem
                    value={option.id}
                    id={`preview-${option.id}`}
                    className="mt-1 mr-2"
                  />
                  <div>
                    <label htmlFor={`preview-${option.id}`}>{option.text}</label>
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
              <div key={option.id} className="flex items-start">
                <Checkbox
                  id={`preview-${option.id}`}
                  className="mr-2 mt-1"
                  checked={currentSelections.includes(option.id)}
                  onCheckedChange={() => handleCheckboxChange(question.id, option.id)}
                />
                <div>
                  <label htmlFor={`preview-${option.id}`}>{option.text}</label>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'likert5':
      case 'likert7':
      case 'likert10':
        const labels = question.options.map(opt => opt.text);
        const count = labels.length;
        
        return (
          <div className="mt-4">
            <RadioGroup name={`likert-${question.id}`}>
              {isMobile ? (
                // Mobile vertical layout
                <div className="flex flex-col space-y-2">
                  {labels.map((label, i) => (
                    <div 
                      key={i}
                      className="flex items-center p-2 border rounded-md"
                    >
                      <RadioGroupItem
                        value={`${i}`}
                        id={`likert-${question.id}-${i}`}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={`likert-${question.id}-${i}`} 
                        className="text-sm"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop grid layout
                <div className={`grid ${getGridColumns(count)} gap-2`}>
                  {labels.map((label, i) => (
                    <div 
                      key={i}
                      className="flex flex-col items-center text-center p-2 border rounded-md"
                    >
                      <RadioGroupItem
                        value={`${i}`}
                        id={`likert-${question.id}-${i}`}
                        className="mx-auto mb-1"
                      />
                      <label 
                        htmlFor={`likert-${question.id}-${i}`} 
                        className="text-xs text-center mt-1 px-1"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </RadioGroup>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ice p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-carbon">{survey.title}</h2>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      {survey.questions.map((question, index) => (
        isQuestionVisible(question) && (
          <div key={question.id} className="mb-6 pb-6 border-b border-ice last:border-b-0">
            <h3 className="font-medium mb-2 text-carbon text-base md:text-lg">
              {index + 1}. {question.text} 
              {question.isRequired && <span className="text-magma ml-1">*</span>}
            </h3>
            
            {question.description && (
              <p className="text-sm text-gray-600 mb-3">{question.description}</p>
            )}

            {question.maxSelections && (
              <p className="text-xs text-gray-500 mb-3">
                (Max selections: {question.maxSelections})
              </p>
            )}

            {question.media && (
              <div className="mb-4 mt-2">
                {question.media.type === 'image' ? (
                  <img 
                    src={question.media.url} 
                    alt="Question media" 
                    className="max-h-48 object-contain rounded-md" 
                  />
                ) : (
                  <video 
                    src={question.media.url} 
                    controls 
                    className="max-h-48 w-full rounded-md"
                  />
                )}
              </div>
            )}

            {question.figmaPrototypeUrl && (
              <div className="mb-4">
                <a 
                  href={question.figmaPrototypeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-abyss underline flex items-center gap-1"
                >
                  <Link size={14} /> View Figma prototype
                </a>
              </div>
            )}

            {renderQuestionInput(question)}
          </div>
        )
      ))}

      {survey.questions.length > 0 && (
        <Button className="mt-4 bg-sunset hover:opacity-90 w-full sm:w-auto">Submit</Button>
      )}

      {survey.questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>This survey has no questions yet.</p>
        </div>
      )}
    </div>
  );
};

export default PreviewTab;
