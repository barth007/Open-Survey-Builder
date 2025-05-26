
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { SurveyFolder } from '@/types/survey-organization';

interface FolderCardProps {
  folder: SurveyFolder;
}

export function FolderCard({ folder }: FolderCardProps) {
  const navigate = useNavigate();

  const handleSurveyClick = (surveyId: string) => {
    navigate(`/survey/${surveyId}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Folder className="h-5 w-5 text-muted-foreground" />
          {folder.name} [{folder.surveys.length}]
        </CardTitle>
      </CardHeader>
      <CardContent>
        {folder.surveys.length > 0 ? (
          <div className="space-y-2">
            {folder.surveys.map((survey) => (
              <button
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)}
                className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm"
              >
                {survey.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No surveys in this folder</p>
        )}
      </CardContent>
    </Card>
  );
}
