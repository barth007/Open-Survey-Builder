
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check, Trash, GripVertical, Image, Video, Link } from "lucide-react";
import QuestionTypeMenu from './QuestionTypeMenu';
import { Question, QuestionOption, QuestionType, LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS } from '@/types/survey';
import MediaUploadButton from './MediaUploadButton';
import QuestionMediaUpload from './QuestionMediaUpload';

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
  const [figmaUrl, setFigmaUrl] = useState(question.figmaPrototypeUrl || '');

  const handleTextChange = (text: string) => {
    onQuestionChange({ ...question, text });
  };

  const handleTypeChange = (type: QuestionType) => {
    // When changing to a Likert scale, pre-populate with appropriate options
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
        options 
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
    // In a real app, you would upload this file to a server and get a URL
    // For demo purposes, we'll create an object URL
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
    // In a real app, you would upload this file to a server and get a URL
    // For demo purposes, we'll create an object URL
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

  const handleFigmaUrlSave = () => {
    onQuestionChange({
      ...question,
      figmaPrototypeUrl: figmaUrl
    });
  };

  const isLikertType = question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10';

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''} border-abyss`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <GripVertical className="cursor-grab text-carbon" size={20} />
          <Input
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Question"
            className="flex-1 border-ice focus-visible:ring-abyss"
          />
          <QuestionTypeMenu
            currentType={question.type}
            onTypeChange={handleTypeChange}
          />
        </div>

        {/* Question Media */}
        <div className="mt-2 mb-4">
          <QuestionMediaUpload onFileSelected={handleQuestionMediaUpload} />
          
          {question.media && (
            <div className="mt-3 p-3 border rounded-md bg-ice relative">
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

        {/* Figma Prototype URL */}
        <div className="flex items-center gap-2">
          <Link size={16} className="text-abyss" />
          <Input
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="Figma Prototype URL (optional)"
            className="flex-1 text-sm border-ice"
          />
          <Button 
            onClick={handleFigmaUrlSave} 
            size="sm" 
            variant="outline"
            className="border-abyss text-abyss hover:bg-abyss hover:text-white"
          >
            <Check size={16} className="mr-1" />
            Save
          </Button>
        </div>

        {/* Max Selections for Checkboxes */}
        {question.type === 'checkboxes' && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={`max-selections-${question.id}`} className="text-sm text-carbon">
                Max selections allowed:
              </Label>
              <Select
                value={question.maxSelections?.toString() || "no-limit"}
                onValueChange={handleMaxSelectionsChange}
              >
                <SelectTrigger id={`max-selections-${question.id}`} className="w-32 border-ice">
                  <SelectValue placeholder="No limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-limit">No limit</SelectItem>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mt-4">
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
                    
                    {/* Display preview if option has media */}
                    {option.media && (
                      <div className="mt-2 p-2 border rounded-md bg-ice">
                        {option.media.type === 'image' || option.media.type === 'gif' ? (
                          <img 
                            src={option.media.url} 
                            alt={option.text} 
                            className="max-h-32 object-contain mx-auto"
                          />
                        ) : (
                          <video 
                            src={option.media.url} 
                            controls 
                            className="max-h-32 w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Media upload buttons */}
                  <div className="flex gap-1">
                    <MediaUploadButton 
                      type="image" 
                      onFileSelected={(file) => handleMediaUpload(option.id, file, 'image')} 
                    />
                    <MediaUploadButton 
                      type="video" 
                      onFileSelected={(file) => handleMediaUpload(option.id, file, 'video')} 
                    />
                    <MediaUploadButton 
                      type="gif" 
                      onFileSelected={(file) => handleMediaUpload(option.id, file, 'gif')} 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOption(option.id)}
                      className="text-magma"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
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
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-6 py-3 border-ice">
        <div className="flex items-center gap-2">
          <Switch
            id={`required-${question.id}`}
            checked={question.isRequired}
            onCheckedChange={handleRequiredChange}
            className="data-[state=checked]:bg-flame"
          />
          <Label htmlFor={`required-${question.id}`} className="text-carbon">Required</Label>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDeleteQuestion(question.id)}
          className="text-magma hover:text-magma hover:bg-red-50"
        >
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
