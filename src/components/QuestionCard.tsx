import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash, 
  GripVertical, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ExternalLink,
  FileImage,
  ChevronUp,
  ChevronDown,
  Settings,
} from "lucide-react";
import { 
  Question, 
  ConditionalLogic, 
  QuestionType, 
  QuestionOption,
  LIKERT_5_LABELS,
  LIKERT_7_LABELS,
  LIKERT_10_LABELS
} from '@/types/survey';
import QuestionTypeMenu from './QuestionTypeMenu';
import MediaUploadButton from './MediaUploadButton';
import QuestionMediaUpload from './QuestionMediaUpload';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import LikertOptionsDialog from './survey/LikertOptionsDialog';
import { FigmaPrototypePreview } from './survey/FigmaPrototypePreview';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => void;
  isDragging?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  isDragging = false,
}) => {
  const [newOptionText, setNewOptionText] = useState('');
  const [figmaUrl, setFigmaUrl] = useState(question.figmaPrototypeUrl || '');
  const [figmaScreenshot, setFigmaScreenshot] = useState(question.figmaScreenshot || '');
  const [hasUrlChanged, setHasUrlChanged] = useState(false);
  const [conditionalLogicOpen, setConditionalLogicOpen] = useState(!!question.conditionalLogic?.dependsOn);

  const [likertOptionsDialogOpen, setLikertOptionsDialogOpen] = useState(false);

  const availableQuestions = questions.filter(q => q.id !== question.id);
  
  const selectedDependentQuestion = question.conditionalLogic?.dependsOn 
    ? questions.find(q => q.id === question.conditionalLogic?.dependsOn)
    : undefined;

  useEffect(() => {
    if (question.conditionalLogic?.dependsOn && 
        ['equals', 'notEquals'].includes(question.conditionalLogic.operator) && 
        selectedDependentQuestion) {
      
      const value = question.conditionalLogic.value;
      const valueExists = selectedDependentQuestion.options.some(opt => opt.id === value);
      
      if (!valueExists && selectedDependentQuestion.options.length > 0) {
        handleConditionalLogicChange('value', selectedDependentQuestion.options[0].id);
      }
    }
  }, [selectedDependentQuestion, question.conditionalLogic]);

  const handleTextChange = (text: string) => {
    onQuestionChange({ ...question, text });
  };

  const handleDescriptionChange = (description: string) => {
    onQuestionChange({ ...question, description });
  };

  const handleTypeChange = (type: QuestionType) => {
    if (type === 'likert5' || type === 'likert7' || type === 'likert10') {
      let labels: string[] = [];
      
      if (type === 'likert5') labels = LIKERT_5_LABELS;
      else if (type === 'likert7') labels = LIKERT_7_LABELS;
      else if (type === 'likert10') labels = LIKERT_10_LABELS;
      
      const options = labels.map((label, index) => ({
        id: `likert-${question.id}-${index}`,
        text: label
      }));
      
      onQuestionChange({ 
        ...question, 
        type,
        options,
        customLikertLabels: false 
      });
    } else {
      onQuestionChange({ ...question, type });
    }
  };

  const handleRequiredChange = (isRequired: boolean) => {
    onQuestionChange({ ...question, isRequired });
  };

  const handleMaxSelectionsChange = (value: string) => {
    const maxSelections = value === "no-limit" ? undefined : parseInt(value);
    onQuestionChange({
      ...question,
      maxSelections: isNaN(maxSelections as number) ? undefined : maxSelections
    });
  };

  const getMaxSelectionsOptions = () => {
    const maxOptions = question.options.length;
    return Array.from({ length: maxOptions }, (_, i) => i + 1).map(num => ({
      value: num.toString(),
      label: num.toString()
    }));
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

  const handleMediaUpload = (optionId: string, file: File, type: 'image' | 'video' | 'gif') => {
    const url = URL.createObjectURL(file);
    
    onQuestionChange({
      ...question,
      options: question.options.map(option => 
        option.id === optionId 
          ? { 
              ...option, 
              media: { 
                type, 
                url 
              } 
            } 
          : option
      )
    });
  };

  const handleQuestionMediaUpload = (file: File, type: 'image' | 'video') => {
    const url = URL.createObjectURL(file);
    
    onQuestionChange({
      ...question,
      media: {
        type,
        url
      }
    });
  };

  const removeQuestionMedia = () => {
    const { media, ...rest } = question;
    onQuestionChange({
      ...rest,
      id: question.id,
      type: question.type,
      text: question.text,
      isRequired: question.isRequired,
      options: question.options,
    });
  };

  const handleFigmaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFigmaUrl(e.target.value);
    setHasUrlChanged(e.target.value !== question.figmaPrototypeUrl);
  };

  const handleFigmaUrlSave = (url: string) => {
    onQuestionChange({
      ...question,
      figmaPrototypeUrl: url
    });
  };

  const handleScreenshotUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    
    onQuestionChange({
      ...question,
      figmaScreenshot: url
    });
    
    setFigmaScreenshot(url);
  };

  const openFigmaPrototype = () => {
    if (figmaUrl) {
      window.open(figmaUrl, '_blank');
    }
  };

  const duplicateQuestion = () => {
    if (onDuplicateQuestion) {
      onDuplicateQuestion(question);
    }
  };

  const handleConditionalLogicChange = (field: keyof ConditionalLogic, value: string) => {
    const updatedLogic: ConditionalLogic = {
      ...(question.conditionalLogic || { operator: 'equals', dependsOn: '' }),
      [field]: value,
    };

    if (field === 'dependsOn' && value !== '') {
      const dependentQuestion = questions.find(q => q.id === value);
      if (dependentQuestion && dependentQuestion.options.length > 0) {
        updatedLogic.value = dependentQuestion.options[0].id;
      } else {
        updatedLogic.value = '';
      }
    } else if (field === 'operator' && ['equals', 'notEquals'].includes(value)) {
      const dependentQuestion = questions.find(q => q.id === updatedLogic.dependsOn);
      if (dependentQuestion && dependentQuestion.options.length > 0 && !updatedLogic.value) {
        updatedLogic.value = dependentQuestion.options[0].id;
      }
    }

    onQuestionChange({
      ...question,
      conditionalLogic: updatedLogic,
    });
  };

  const handleLikertOptionsEdit = () => {
    setLikertOptionsDialogOpen(true);
  };

  const saveLikertOptions = (newOptions: QuestionOption[]) => {
    onQuestionChange({
      ...question,
      options: newOptions,
      customLikertLabels: true
    });
  };

  const isMultipleType = question.type === 'multipleChoice' || question.type === 'checkboxes';
  const isLikertType = question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10';
  
  const hasConditionalLogic = !!question.conditionalLogic?.dependsOn;

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''} border-abyss`}>
      <CardContent className="pt-6 space-y-5">
        {/* Title */}
        <div className="flex items-center gap-3">
          <GripVertical className="cursor-grab text-carbon" size={20} />
          <Input
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Question"
            className="flex-1 border-ice focus-visible:ring-abyss"
          />
        </div>

        {/* Description */}
        <div>
          <Textarea
            value={question.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Question description (optional)"
            className="w-full resize-none border-ice focus-visible:ring-abyss"
            rows={2}
          />
        </div>

        {/* Media Section */}
        <div className="space-y-3">
          <div className="border-t border-ice pt-3">
            <QuestionMediaUpload onFileSelected={handleQuestionMediaUpload} />
            
            {question.media && (
              <div className="mt-3 p-3 border rounded-md bg-white relative">
                {question.media.type === 'image' ? (
                  <img 
                    src={question.media.url} 
                    alt="Question media" 
                    className="max-h-40 object-contain mx-auto" 
                  />
                ) : (
                  <video 
                    src={question.media.url} 
                    controls 
                    className="max-h-40 w-full" 
                  />
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeQuestionMedia}
                >
                  <Trash size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Figma Prototype */}
        <FigmaPrototypePreview
          figmaUrl={question.figmaPrototypeUrl || ''}
          questionId={question.id}
          onFigmaUrlSave={handleFigmaUrlSave}
          onScreenshotUpload={handleScreenshotUpload}
          hasScreenshot={!!question.figmaScreenshot}
        />

        {/* Question Type & Max Answers */}
        <div className="border-t border-ice pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="w-full">
              <QuestionTypeMenu
                currentType={question.type}
                onTypeChange={handleTypeChange}
                className="w-full"
              />
            </div>
            <div className="w-full">
              <Select
                value={question.maxSelections?.toString() || "no-limit"}
                onValueChange={handleMaxSelectionsChange}
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

        {/* Answer Options */}
        <div className="border-t border-ice pt-3">
          {question.type === 'text' && (
            <Input disabled placeholder="Text answer will appear here" className="bg-muted/50" />
          )}

          {(question.type === 'multipleChoice' || question.type === 'checkboxes') && !isLikertType && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-start gap-2">
                  {question.type === 'multipleChoice' ? (
                    <RadioGroup className="flex mt-3">
                      <RadioGroupItem value={option.id} id={option.id} disabled />
                    </RadioGroup>
                  ) : (
                    <Checkbox disabled id={option.id} className="mt-3" />
                  )}
                  <div className="flex-1">
                    <Input 
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      className="flex-1 border-ice"
                    />
                  </div>
                  
                  {option.media && (
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <FileImage size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(option.id)}
                    className="text-magma mt-1"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  placeholder="Add option"
                  className="flex-1 border-ice"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addOption();
                    }
                  }}
                />
                <Button 
                  onClick={addOption} 
                  size="sm" 
                  variant="outline"
                  className="border-abyss text-abyss hover:bg-abyss hover:text-white"
                >
                  <Check size={16} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {isLikertType && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Likert Scale Options</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLikertOptionsEdit}
                  className="flex items-center gap-1"
                >
                  <Settings size={14} />
                  Customize Options
                </Button>
              </div>
              <RadioGroup>
                <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 mt-2">
                  {question.options.map((option, index) => (
                    <div key={option.id} className="flex flex-col items-center">
                      <RadioGroupItem value={option.id} id={option.id} disabled className="mx-auto" />
                      <Label htmlFor={option.id} className="text-xs text-center mt-1">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        {/* Conditional Logic */}
        <div className="mt-4">
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
                        handleConditionalLogicChange('dependsOn', value === 'none' ? '' : value)
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
                          onValueChange={(value) => handleConditionalLogicChange('operator', value)}
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
                              onValueChange={(value) => handleConditionalLogicChange('value', value)}
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
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-3 border-ice">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={handleRequiredChange}
              className="data-[state=checked]:bg-flame"
            />
            <Label htmlFor={`required-${question.id}`} className="ml-2 text-carbon whitespace-nowrap">Required</Label>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onDuplicateQuestion && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={duplicateQuestion}
              className="text-abyss border-abyss hover:bg-abyss hover:text-white"
            >
              <Copy size={16} className="mr-1" />
              Duplicate
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDeleteQuestion(question.id)}
            className="text-magma hover:text-magma hover:bg-red-50"
          >
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>

      {/* Likert Scale Options Edit Dialog */}
      <LikertOptionsDialog
        isOpen={likertOptionsDialogOpen}
        onClose={() => setLikertOptionsDialogOpen(false)}
        options={question.options}
        onSave={saveLikertOptions}
      />
    </Card>
  );
};

export default QuestionCard;
