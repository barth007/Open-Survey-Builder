
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reconstructSurveyQuestions } from '@/utils/surveyReconstruction';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

const SurveyRecovery: React.FC = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isReconstructing, setIsReconstructing] = useState(false);

  const handleReconstruction = async () => {
    if (!surveyId) return;

    setIsReconstructing(true);
    try {
      await reconstructSurveyQuestions(surveyId);
      
      toast({
        title: "Survey Reconstructed",
        description: "Your original survey questions have been successfully restored!",
      });

      // Navigate back to the survey
      navigate(`/survey/${surveyId}`);
    } catch (error) {
      console.error('Reconstruction error:', error);
      toast({
        title: "Reconstruction Failed",
        description: error instanceof Error ? error.message : "Failed to reconstruct survey",
        variant: "destructive"
      });
    } finally {
      setIsReconstructing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Survey Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            We've detected that your survey questions may have been corrupted. 
            We can reconstruct them based on your existing response data.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleReconstruction}
              disabled={isReconstructing}
              className="w-full"
            >
              {isReconstructing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reconstructing...
                </>
              ) : (
                'Reconstruct Survey Questions'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyRecovery;
