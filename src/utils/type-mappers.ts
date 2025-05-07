
import { DbSurvey, DbSurveyResponse, Json } from '@/types/database';
import { Survey, SurveyResponse, Question, Answer } from '@/types/survey';

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
    // Match property names with the Survey type definition
    folderId: dbSurvey.folder_id || undefined,
    teamId: dbSurvey.team_id || undefined,
    publicCode: dbSurvey.public_code || undefined,
    // New fields for welcome and thank you pages
    welcomeTitle: dbSurvey.welcome_title || undefined,
    welcomeMessage: dbSurvey.welcome_message || undefined,
    thankYouTitle: dbSurvey.thank_you_title || undefined,
    thankYouMessage: dbSurvey.thank_you_message || undefined,
    redirectUrl: dbSurvey.redirect_url || undefined
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
    // Cast questions to Json as it's stored as JSONB in the database
    questions: survey.questions as unknown as Json,
    folder_id: survey.folderId,
    team_id: survey.teamId,
    public_code: survey.publicCode,
    // New fields for welcome and thank you pages
    welcome_title: survey.welcomeTitle,
    welcome_message: survey.welcomeMessage,
    thank_you_title: survey.thankYouTitle,
    thank_you_message: survey.thankYouMessage,
    redirect_url: survey.redirectUrl
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
    // Cast answers to Json as it's stored as JSONB in the database
    answers: response.answers as unknown as Json,
    submitted_at: response.submittedAt
  };
}
