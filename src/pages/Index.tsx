
import React, { useState } from 'react';
import { Question, Survey } from '@/types/survey';
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Survey Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("preview")} className="flex gap-2">
              <Eye size={18} />
              Preview
            </Button>
            <Button onClick={handleSave} className="flex gap-2">
              <Save size={18} />
              Save
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-2">{survey.title}</h2>
              <p className="text-gray-600 mb-6">{survey.description}</p>

              {survey.questions.map((question, index) => (
                <div key={question.id} className="mb-6 pb-6 border-b last:border-b-0">
                  <h3 className="font-medium mb-2">
                    {index + 1}. {question.text} 
                    {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>

                  {question.type === 'text' && (
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Your answer"
                    />
                  )}

                  {question.type === 'multipleChoice' && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="radio"
                            id={`preview-${option.id}`}
                            name={`question-${question.id}`}
                            className="mr-2"
                          />
                          <label htmlFor={`preview-${option.id}`}>{option.text}</label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'checkboxes' && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`preview-${option.id}`}
                            className="mr-2"
                          />
                          <label htmlFor={`preview-${option.id}`}>{option.text}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {survey.questions.length > 0 && (
                <Button className="mt-4">Submit</Button>
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
