import { DbSurvey, DbSurveyResponse, Json } from '@/types/database';
import { Survey, SurveyResponse, Question, Answer } from '@/types/survey';
import { Survey as OrganizationSurvey, convertToOrganizationSurvey } from '@/types/survey-organization';

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
        media: q.media,
        figmaPrototypeUrl: q.figmaPrototypeUrl,
        figmaScreenshot: q.figmaScreenshot,
        conditionalLogic: q.conditionalLogic,
        customLikertLabels: q.customLikertLabels,
        isVisible: q.isVisible !== undefined ? q.isVisible : true,
        recordingEnabled: q.recordingEnabled || false,
        recordingRequired: q.recordingRequired || false
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
    order: dbSurvey.order || undefined,
    createdAt: dbSurvey.created_at || new Date().toISOString(),
    // Welcome page fields - now including welcome_instructions and welcome_button_text
    welcomeTitle: dbSurvey.welcome_title || undefined,
    welcomeMessage: dbSurvey.welcome_message || undefined,
    welcomeInstructions: dbSurvey.welcome_instructions || undefined,
    welcomeButtonText: dbSurvey.welcome_button_text || undefined,
    // Thank you page fields - now including thank_you_button_text
    thankYouTitle: dbSurvey.thank_you_title || undefined,
    thankYouMessage: dbSurvey.thank_you_message || undefined,
    thankYouButtonText: dbSurvey.thank_you_button_text || undefined,
    redirectUrl: dbSurvey.redirect_url || undefined,
    // Survey-wide recording settings
    recordingEnabled: dbSurvey.recording_enabled || false,
    recordingRequired: dbSurvey.recording_required || false
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
    order: survey.order,
    // Welcome page fields - now including all fields
    welcome_title: survey.welcomeTitle,
    welcome_message: survey.welcomeMessage,
    welcome_instructions: survey.welcomeInstructions,
    welcome_button_text: survey.welcomeButtonText,
    // Thank you page fields - now including thank_you_button_text
    thank_you_title: survey.thankYouTitle,
    thank_you_message: survey.thankYouMessage,
    thank_you_button_text: survey.thankYouButtonText,
    redirect_url: survey.redirectUrl,
    // Survey-wide recording settings
    recording_enabled: survey.recordingEnabled,
    recording_required: survey.recordingRequired
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

/**
 * Convert a database survey to an organization survey format (simplified)
 */
export function dbSurveyToOrganizationSurvey(dbSurvey: DbSurvey): OrganizationSurvey {
  return {
    id: dbSurvey.id,
    name: dbSurvey.name,
    createdAt: dbSurvey.created_at || new Date().toISOString(),
    folderId: dbSurvey.folder_id,
    isPublished: dbSurvey.is_published || false
  };
}

/**
 * Convert a frontend survey to an organization survey format (simplified)
 */
export function surveyToOrganizationSurvey(survey: Survey): OrganizationSurvey {
  return convertToOrganizationSurvey(survey);
}
