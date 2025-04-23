import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuerySurvey } from '@/hooks/survey/useQuerySurvey';
import { Button } from "@/components/ui/button";
import { useSubmitResponse } from '@/hooks/survey/useSubmitResponse';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Survey, Question } from '@/types/survey';

const SurveyResponse = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const { data: surveyData, isLoading, error } = useQuerySurvey(surveyId);
  const { submitResponse } = useSubmitResponse();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!surveyId || !surveyData) return;

    setIsSubmitting(true);
    
    // Transform answers into the format expected by the API
    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));
    
    try {
      // Check if survey is published - use is_published from database response
      const isPublished = surveyData.is_published === true;
      
      await submitResponse(surveyId, formattedAnswers, isPublished);
      
      // Show different messages based on whether responses are being saved
      if (isPublished) {
        toast({
          title: "Success",
          description: "Your response has been submitted. Thank you!",
        });
      } else {
        toast({
          title: "Response viewed",
          description: "This survey is currently in preview mode. Your responses were not saved.",
        });
      }
      
      // Clear form
      setAnswers({});
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic || !question.conditionalLogic.dependsOn) return true;
    
    const { dependsOn, operator, value } = question.conditionalLogic;
    const answer = answers[dependsOn];
    
    const dependentQuestion = surveyData?.questions.find(q => q.id === dependsOn);
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
  };

  const handleCheckboxChange = (questionId: string, optionId: string) => {
    const currentAnswers = answers[questionId] as string[] || [];
    const maxSelections = surveyData?.questions.find(q => q.id === questionId)?.maxSelections;
    
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

  const handleTextChange = (questionId: string, value: string) => {
    handleAnswerChange(questionId, value);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Survey Not Found</h2>
          <p>The survey you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isPublished = surveyData.is_published === true;

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
          <h2 className="text-2xl font-bold mb-2 text-carbon">{surveyData.title || surveyData.name}</h2>
          <p className="text-gray-600 mb-6">{surveyData.description}</p>

          {!isPublished && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <p className="text-sm font-medium">This survey is in preview mode</p>
              <p className="text-xs">Responses will not be saved until the survey is published</p>
            </div>
          )}

          {surveyData.questions.map((question, index) => (
            isQuestionVisible(question) && (
              <div key={question.id} className="mb-6 pb-6 border-b border-ice last:border-b-0">
                <h3 className="font-medium mb-2 text-carbon">
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

          {surveyData.questions.length > 0 && (
            <Button 
              className="mt-4 bg-sunset hover:opacity-90"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}

          {surveyData.questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>This survey has no questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResponse;
