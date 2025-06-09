
import React from 'react';
import { Survey, SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { getResponseProcessingStats } from './ResponsesProcessor';

interface ResponseDebugViewProps {
  survey: Survey;
  responses: SurveyResponse[] | undefined;
}

export const ResponseDebugView: React.FC<ResponseDebugViewProps> = ({
  survey,
  responses
}) => {
  const stats = getResponseProcessingStats(survey, responses);
  
  // Get detailed breakdown of question IDs
  const currentQuestionIds = survey.questions.map(q => ({ id: q.id, text: q.text }));
  
  const responseQuestionIds = new Set<string>();
  responses?.forEach(response => {
    response.answers.forEach(answer => {
      responseQuestionIds.add(answer.questionId);
    });
  });

  const orphanedQuestionIds = Array.from(responseQuestionIds).filter(
    qId => !currentQuestionIds.some(cq => cq.id === qId)
  );

  const matchedQuestionIds = currentQuestionIds.filter(
    cq => responseQuestionIds.has(cq.id)
  );

  const questionsWithoutResponses = currentQuestionIds.filter(
    cq => !responseQuestionIds.has(cq.id)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            Response Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalResponses}</div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.matchedQuestions}</div>
              <div className="text-sm text-gray-600">Matched Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{orphanedQuestionIds.length}</div>
              <div className="text-sm text-gray-600">Orphaned Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.questionsWithoutResponses}</div>
              <div className="text-sm text-gray-600">No Responses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {matchedQuestionIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              Questions with Responses ({matchedQuestionIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matchedQuestionIds.map(question => (
                <div key={question.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {question.id}
                  </Badge>
                  <span className="text-sm">{question.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {questionsWithoutResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <XCircle size={20} />
              Questions without Responses ({questionsWithoutResponses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {questionsWithoutResponses.map(question => (
                <div key={question.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {question.id}
                  </Badge>
                  <span className="text-sm">{question.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {orphanedQuestionIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle size={20} />
              Orphaned Question IDs ({orphanedQuestionIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              These question IDs exist in responses but not in the current survey. 
              This usually happens when questions are deleted or their IDs change.
            </p>
            <div className="space-y-2">
              {orphanedQuestionIds.map(questionId => (
                <div key={questionId} className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {questionId}
                  </Badge>
                  <span className="text-sm text-gray-500">Archived question data</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
