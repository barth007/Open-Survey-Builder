export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database/API Survey type.
 * Supports both legacy snake_case and current backend camelCase keys.
 */
export interface DbSurvey {
  id: string;
  name: string;
  description: string | null;
  questions: Json;
  is_published?: boolean | null;
  isPublished?: boolean | null;
  folder_id?: string | null;
  folderId?: string | null;
  team_id?: string | null;
  teamId?: string | null;
  order?: number | null;
  public_code?: string | null;
  publicCode?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  user_id?: string | null;
  userId?: string | null;
  welcome_title?: string | null;
  welcomeTitle?: string | null;
  welcome_message?: string | null;
  welcomeMessage?: string | null;
  welcome_instructions?: string | null;
  welcomeInstructions?: string | null;
  welcome_button_text?: string | null;
  welcomeButtonText?: string | null;
  thank_you_title?: string | null;
  thankYouTitle?: string | null;
  thank_you_message?: string | null;
  thankYouMessage?: string | null;
  thank_you_button_text?: string | null;
  thankYouButtonText?: string | null;
  redirect_url?: string | null;
  redirectUrl?: string | null;
  recording_enabled?: boolean | null;
  recordingEnabled?: boolean | null;
  recording_required?: boolean | null;
  recordingRequired?: boolean | null;
  settings?: Json | null;
  appearance?: Json | null;
  branding?: Json | null;
  shareMeta?: Json | null;
  seo?: Json | null;
  notifications?: Json | null;
  retention?: Json | null;
  delivery?: Json | null;
  publicAccessState?: Json | null;
}

/**
 * Database/API SurveyResponse type.
 * Supports both legacy snake_case and current backend camelCase keys.
 */
export interface DbSurveyResponse {
  id: string;
  survey_id?: string | null;
  surveyId?: string | null;
  answers: Json;
  submitted_at?: string | null;
  submittedAt?: string | null;
  participant_id?: string | null;
  participantId?: string | null;
  participant_email?: string | null;
  participantEmail?: string | null;
  deleted_at?: string | null;
  deletedAt?: string | null;
  metadata: Json | null;
  status?: string | null;
}

export interface DbResponseDeletion {
  id: string;
  survey_id?: string;
  surveyId?: string;
  participant_id?: string | null;
  participantId?: string | null;
  participant_email?: string | null;
  participantEmail?: string | null;
  deleted_by?: string | null;
  deletedBy?: string | null;
  deletion_reason?: string | null;
  deletionReason?: string | null;
  responses_count?: number;
  responsesCount?: number;
  deleted_at?: string | null;
  deletedAt?: string | null;
  responses_backup?: Json | null;
  responsesBackup?: Json | null;
}
