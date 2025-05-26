
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Users, Share, Lock } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { Badge } from '@/components/ui/badge';
import { useQuerySurveyResponses } from '@/hooks/survey/useQuerySurveyResponses';

interface SurveyCardProps {
  survey: Survey;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const navigate = useNavigate();
  const { data: responses = [] } = useQuerySurveyResponses(survey.id);

  const handleCardClick = () => {
    navigate(`/survey/${survey.id}`);
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {survey.name} [{responses.length}]
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Team info - placeholder for now since we don't have team data in the survey type */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Personal</span>
        </div>
        
        {/* Sharing status */}
        <div className="flex items-center gap-2">
          {survey.isPublished ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Share className="h-3 w-3" />
              Sharing Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Not Enabled
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
