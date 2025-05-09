
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeatmapVisualization } from './HeatmapVisualization';
import { Image, Info } from 'lucide-react';
import { useQuerySurvey } from '@/hooks/survey/useQuerySurvey';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FigmaHeatmapCardProps {
  questionId: string;
  questionText: string;
  figmaUrl: string;
  surveyId?: string;
}

export const FigmaHeatmapCard: React.FC<FigmaHeatmapCardProps> = ({
  questionId,
  questionText,
  figmaUrl,
  surveyId
}) => {
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { data: surveyData } = useQuerySurvey(surveyId);
  
  // Check if there's a screenshot available for this question in the survey data
  useEffect(() => {
    if (surveyData) {
      const question = surveyData.questions.find(q => q.id === questionId);
      if (question && question.figmaScreenshot) {
        setScreenshotUrl(question.figmaScreenshot);
        setShowHeatmap(true);
      }
    }
  }, [surveyData, questionId]);
  
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotUrl(url);
      setShowHeatmap(true);
    }
  };
  
  return (
    <Card className="mb-6 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          {questionText}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Click heatmap shows where users clicked on the prototype</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <a 
              href={figmaUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-abyss underline flex items-center gap-1 mb-2"
            >
              View Figma prototype
            </a>
            
            {!showHeatmap ? (
              <div className="border border-dashed border-border rounded-lg p-6 bg-muted/20">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Upload a screenshot of your prototype</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      To visualize click data, we need an image of your Figma prototype
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`figma-screenshot-${questionId}`} className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm text-center">
                        Upload screenshot
                      </div>
                      <Input 
                        id={`figma-screenshot-${questionId}`}
                        type="file" 
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Click Heatmap</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setScreenshotUrl('');
                      setShowHeatmap(false);
                    }}
                  >
                    Change screenshot
                  </Button>
                </div>
                <HeatmapVisualization 
                  questionId={questionId}
                  imageUrl={screenshotUrl}
                />
                <p className="text-xs text-muted-foreground">
                  The heatmap shows where users clicked on your prototype. Red areas indicate more frequent clicks.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
