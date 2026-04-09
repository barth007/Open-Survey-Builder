import { DbSurvey, DbSurveyResponse, Json } from '@/types/database';
import { Survey, SurveyResponse, Question, Answer } from '@/types/survey';
import { Survey as OrganizationSurvey, convertToOrganizationSurvey } from '@/types/survey-organization';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getValue = <T>(value: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key] as T;
    }
  }

  return undefined;
};

/**
 * Convert a database survey to a frontend survey
 */
export function dbSurveyToSurvey(dbSurvey: DbSurvey): Survey {
  const surveyRecord = dbSurvey as unknown as Record<string, unknown>;
  const rawQuestions = Array.isArray(dbSurvey.questions) ? dbSurvey.questions : [];

  // Parse the questions from JSON to our Question type
  const parsedQuestions: Question[] = rawQuestions
    .map((q: any) => ({
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

  return {
    id: dbSurvey.id,
    title: dbSurvey.name,
    description: dbSurvey.description || "",
    questions: parsedQuestions,
    isPublished: Boolean(getValue<boolean>(surveyRecord, 'isPublished', 'is_published')),
    // Match property names with the Survey type definition
    folderId: getValue<string | null>(surveyRecord, 'folderId', 'folder_id') || undefined,
    teamId: getValue<string | null>(surveyRecord, 'teamId', 'team_id') || undefined,
    teamName: isRecord(surveyRecord.team) ? (surveyRecord.team.name as string | undefined) : undefined,
    publicCode: getValue<string | null>(surveyRecord, 'publicCode', 'public_code') || undefined,
    order: getValue<number | null>(surveyRecord, 'order') || undefined,
    createdAt: getValue<string | null>(surveyRecord, 'createdAt', 'created_at') || new Date().toISOString(),
    updatedAt: getValue<string | null>(surveyRecord, 'updatedAt', 'updated_at') || undefined,
    // Welcome page fields - now including welcome_instructions and welcome_button_text
    welcomeTitle: getValue<string | null>(surveyRecord, 'welcomeTitle', 'welcome_title') || undefined,
    welcomeMessage: getValue<string | null>(surveyRecord, 'welcomeMessage', 'welcome_message') || undefined,
    welcomeInstructions: getValue<string | null>(surveyRecord, 'welcomeInstructions', 'welcome_instructions') || undefined,
    welcomeButtonText: getValue<string | null>(surveyRecord, 'welcomeButtonText', 'welcome_button_text') || undefined,
    // Thank you page fields - now including thank_you_button_text
    thankYouTitle: getValue<string | null>(surveyRecord, 'thankYouTitle', 'thank_you_title') || undefined,
    thankYouMessage: getValue<string | null>(surveyRecord, 'thankYouMessage', 'thank_you_message') || undefined,
    thankYouButtonText: getValue<string | null>(surveyRecord, 'thankYouButtonText', 'thank_you_button_text') || undefined,
    redirectUrl: getValue<string | null>(surveyRecord, 'redirectUrl', 'redirect_url') || undefined,
    // Survey-wide recording settings
    recordingEnabled: Boolean(getValue<boolean>(surveyRecord, 'recordingEnabled', 'recording_enabled')),
    recordingRequired: Boolean(getValue<boolean>(surveyRecord, 'recordingRequired', 'recording_required')),
    ...(isRecord(surveyRecord.settings) ? { settings: surveyRecord.settings } : {}),
    ...(isRecord(surveyRecord.appearance) ? { appearance: surveyRecord.appearance } : {}),
    ...(isRecord(surveyRecord.branding) ? { branding: surveyRecord.branding } : {}),
    ...(isRecord(surveyRecord.shareMeta) ? { shareMeta: surveyRecord.shareMeta } : {}),
    ...(isRecord(surveyRecord.seo) ? { seo: surveyRecord.seo } : {}),
    ...(isRecord(surveyRecord.notifications) ? { notifications: surveyRecord.notifications } : {}),
    ...(isRecord(surveyRecord.retention) ? { retention: surveyRecord.retention } : {}),
    ...(isRecord(surveyRecord.delivery) ? { delivery: surveyRecord.delivery } : {}),
    ...(isRecord(surveyRecord.publicAccessState) ? { publicAccessState: surveyRecord.publicAccessState } : {}),
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
  const responseRecord = dbResponse as unknown as Record<string, unknown>;

  return {
    id: dbResponse.id,
    surveyId: getValue<string | null>(responseRecord, 'surveyId', 'survey_id') || "",
    answers: Array.isArray(dbResponse.answers) ? dbResponse.answers.map((a: any) => ({
      questionId: a.questionId,
      value: a.value
    })) : [],
    submittedAt: getValue<string | null>(responseRecord, 'submittedAt', 'submitted_at') || "",
    participantId: getValue<string | null>(responseRecord, 'participantId', 'participant_id') || undefined,
    metadata: (dbResponse.metadata as Record<string, any> | null) || undefined,
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
  const surveyRecord = dbSurvey as unknown as Record<string, unknown>;

  return {
    id: dbSurvey.id,
    name: dbSurvey.name,
    createdAt: getValue<string | null>(surveyRecord, 'createdAt', 'created_at') || new Date().toISOString(),
    folderId: getValue<string | null>(surveyRecord, 'folderId', 'folder_id'),
    isPublished: Boolean(getValue<boolean>(surveyRecord, 'isPublished', 'is_published')),
    teamId: getValue<string | null>(surveyRecord, 'teamId', 'team_id'),
    teamName: isRecord(surveyRecord.team) ? (surveyRecord.team.name as string | undefined) : undefined,
  };
}

/**
 * Convert a frontend survey to an organization survey format (simplified)
 */
export function surveyToOrganizationSurvey(survey: Survey): OrganizationSurvey {
  return convertToOrganizationSurvey(survey);
}
