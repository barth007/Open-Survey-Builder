
import { DbSurvey, DbSurveyResponse } from '@/types/database-types';
import { Survey, SurveyResponse, Question } from '@/types/survey';

/**
 * Convert a database survey to a frontend survey
 */
export function dbSurveyToSurvey(dbSurvey: DbSurvey): Survey {
  // Parse the questions from JSON to our Question type
  const parsedQuestions: Question[] = Array.isArray(dbSurvey.questions) 
    ? dbSurvey.questions.map((q: any) => ({
        id: q.id || "",
        type: q.type || "text",
        text: q.text || "",
        description: q.description,
        isRequired: q.isRequired || false,
        options: Array.isArray(q.options) ? q.options : [],
        maxSelections: q.maxSelections,
        figmaPrototypeUrl: q.figmaPrototypeUrl,
        media: q.media,
        conditionalLogic: q.conditionalLogic,
        isVisible: q.isVisible !== undefined ? q.isVisible : true
      }))
    : [];

  return {
    id: dbSurvey.id,
    title: dbSurvey.name,
    description: dbSurvey.description || "",
    questions: parsedQuestions,
    isPublished: dbSurvey.is_published || false,
    folderId: dbSurvey.folder_id || undefined
  };
}

/**
 * Convert a frontend survey to a database survey
 */
export function surveyToDbSurvey(survey: Survey): Partial<DbSurvey> {
  return {
    id: survey.id,
    name: survey.title,
    description: survey.description,
    is_published: survey.isPublished,
    questions: survey.questions,
    folder_id: survey.folderId
  };
}

/**
 * Convert a database survey response to a frontend survey response
 */
export function dbSurveyResponseToSurveyResponse(dbResponse: DbSurveyResponse): SurveyResponse {
  return {
    id: dbResponse.id,
    surveyId: dbResponse.survey_id || "",
    answers: Array.isArray(dbResponse.answers) ? dbResponse.answers.map((a: any) => ({
      questionId: a.questionId,
      value: a.value
    })) : [],
    submittedAt: dbResponse.submitted_at || ""
  };
}

/**
 * Convert a frontend survey response to a database survey response
 */
export function surveyResponseToDbSurveyResponse(response: SurveyResponse): Partial<DbSurveyResponse> {
  return {
    id: response.id,
    survey_id: response.surveyId,
    answers: response.answers,
    submitted_at: response.submittedAt
  };
}
