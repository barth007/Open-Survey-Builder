
import React, { useState } from 'react';
import { Question, Survey, LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import QuestionCard from '@/components/QuestionCard';
import AddQuestionButton from '@/components/AddQuestionButton';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Save, Link, BarChart2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link as RouterLink } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import AnswersTab from '@/components/AnswersTab';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "answers">("edit");
  
  const [survey, setSurvey] = useState<Survey>({
    id: "survey-1",
    title: "Untitled Survey",
    description: "Survey description",
    questions: [],
    isPublished: false
  });

  const handleTitleChange = (title: string) => {
    setSurvey((prev) => ({ ...prev, title }));
  };

  const handleDescriptionChange = (description: string) => {
    setSurvey((prev) => ({ ...prev, description }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      isRequired: false,
      options: []
    };
    
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionToDuplicate: Question) => {
    const newQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      options: questionToDuplicate.options.map(option => ({
        ...option,
        id: `${Date.now()}-${option.id}`
      }))
    };

    setSurvey((prev) => {
      const questionIndex = prev.questions.findIndex(q => q.id === questionToDuplicate.id);
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(questionIndex + 1, 0, newQuestion);
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });

    toast({
      title: "Question duplicated",
      description: "The question has been duplicated successfully.",
    });
  };

  const handleSave = () => {
    // In a real app, we would save the survey to a backend
    console.log("Survey data:", survey);
    toast({
      title: "Survey saved",
      description: "Your survey has been saved successfully",
    });
  };

  const togglePublish = () => {
    setSurvey(prev => ({
      ...prev,
      isPublished: !prev.isPublished
    }));

    toast({
      title: survey.isPublished ? "Survey unpublished" : "Survey published",
      description: survey.isPublished 
        ? "The survey is now in draft mode" 
        : "The survey is now live and can receive responses",
    });
  };

  const renderQuestionInput = (question: Question, index: number) => {
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
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start">
                <RadioGroup name={`question-${question.id}`} className="flex mt-1 mr-2">
                  <RadioGroupItem
                    value={`preview-${option.id}`}
                    id={`preview-${option.id}`}
                  />
                </RadioGroup>
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
          </div>
        );
      
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start">
                <Checkbox
                  id={`preview-${option.id}`}
                  className="mr-2 mt-1"
                />
                <div>
                  <label htmlFor={`preview-${option.id}`}>
                    {option.text}
                    {question.maxSelections && 
                      <span className="text-xs text-gray-500 ml-1">
                        (Max selections: {question.maxSelections})
                      </span>
                    }
                  </label>
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
        const likertLabels = 
          question.type === 'likert5' ? LIKERT_5_LABELS :
          question.type === 'likert7' ? LIKERT_7_LABELS :
          LIKERT_10_LABELS;
        
        const columns = likertLabels.length;
        const gridClass = `grid grid-cols-5 md:grid-cols-${columns} gap-1`;
        
        return (
          <div className="mt-4">
            <RadioGroup name={`likert-${question.id}`}>
              <div className={gridClass}>
                {likertLabels.map((label, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={`${i}`}
                      id={`likert-${question.id}-${i}`}
                      className="mx-auto"
                    />
                    <label 
                      htmlFor={`likert-${question.id}-${i}`} 
                      className="text-xs text-center mt-1"
                    >
                      {label}
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

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-abyss">Survey Builder</h1>
          <div className="flex gap-2">
            {activeTab !== "preview" && (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("preview")} 
                className="flex gap-2 border-abyss text-abyss hover:bg-abyss hover:text-white"
              >
                <Eye size={18} />
                Preview
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              className="flex gap-2 bg-sunset hover:opacity-90"
            >
              <Save size={18} />
              Save
            </Button>
            <Button 
              onClick={togglePublish} 
              variant={survey.isPublished ? "destructive" : "outline"} 
              className={survey.isPublished ? "" : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"}
            >
              {survey.isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "answers")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-ice">
            <TabsTrigger value="edit" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Edit</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Preview</TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-abyss data-[state=active]:text-white">
              <span className="flex items-center gap-1">
                <BarChart2 size={16} />
                Answers
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <SurveyTitle
              title={survey.title}
              description={survey.description}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
            />

            {survey.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onQuestionChange={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onDuplicateQuestion={duplicateQuestion}
              />
            ))}

            <AddQuestionButton onClick={addQuestion} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
              <h2 className="text-2xl font-bold mb-2 text-carbon">{survey.title}</h2>
              <p className="text-gray-600 mb-6">{survey.description}</p>

              {survey.questions.map((question, index) => (
                <div key={question.id} className="mb-6 pb-6 border-b border-ice last:border-b-0">
                  <h3 className="font-medium mb-2 text-carbon">
                    {index + 1}. {question.text} 
                    {question.isRequired && <span className="text-magma ml-1">*</span>}
                  </h3>
                  
                  {/* Display question description if available */}
                  {question.description && (
                    <p className="text-sm text-gray-600 mb-3">{question.description}</p>
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

                  {renderQuestionInput(question, index)}
                </div>
              ))}

              {survey.questions.length > 0 && (
                <Button className="mt-4 bg-sunset hover:opacity-90">Submit</Button>
              )}

              {survey.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>This survey has no questions yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            <AnswersTab survey={survey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
