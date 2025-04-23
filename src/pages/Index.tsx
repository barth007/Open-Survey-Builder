
import React, { useState } from 'react';
import { Question, Survey, LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import QuestionCard from '@/components/QuestionCard';
import AddQuestionButton from '@/components/AddQuestionButton';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  
  const [survey, setSurvey] = useState<Survey>({
    title: "Untitled Survey",
    description: "Survey description",
    questions: []
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

  const handleSave = () => {
    // In a real app, we would save the survey to a backend
    console.log("Survey data:", survey);
    toast({
      title: "Survey saved",
      description: "Your survey has been saved successfully",
    });
  };

  // Helper function to render the appropriate input based on question type in preview
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
                <input
                  type="radio"
                  id={`preview-${option.id}`}
                  name={`question-${question.id}`}
                  className="mr-2 mt-1"
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
          </div>
        );
      
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start">
                <input
                  type="checkbox"
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
        
        return (
          <div className="mt-4">
            <div className={`grid grid-cols-${likertLabels.length} gap-1`}>
              {likertLabels.map((label, i) => (
                <div key={i} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name={`likert-${question.id}`}
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
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("preview")} 
              className="flex gap-2 border-abyss text-abyss hover:bg-abyss hover:text-white"
            >
              <Eye size={18} />
              Preview
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex gap-2 bg-sunset hover:opacity-90"
            >
              <Save size={18} />
              Save
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-ice">
            <TabsTrigger value="edit" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Edit</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Preview</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
