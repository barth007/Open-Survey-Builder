
// Import Json type from supabase types
import { Json } from "@/integrations/supabase/types";

/**
 * Database Survey type - represents a survey in the database
 */
export interface DbSurvey {
  id: string;
  name: string;
  description: string | null;
  questions: Json;
  is_published: boolean | null;
  folder_id: string | null;
  team_id: string | null;
  order: number | null;
  public_code: string | null;
  created_at: string | null;
  user_id: string | null;
  // Welcome page fields - now including all new fields
  welcome_title: string | null;
  welcome_message: string | null;
  welcome_instructions: string | null;
  welcome_button_text: string | null;
  // Thank you page fields - now including thank_you_button_text
  thank_you_title: string | null;
  thank_you_message: string | null;
  thank_you_button_text: string | null;
  redirect_url: string | null;
}

/**
 * Database SurveyResponse type - represents a survey response in the database
 */
export interface DbSurveyResponse {
  id: string;
  survey_id: string | null;
  answers: Json;
  submitted_at: string | null;
  participant_id: string | null;
  participant_email: string | null; // Added new field
  deleted_at: string | null; // Added new field for soft delete
  metadata: Json | null;
}

/**
 * Database ResponseDeletion type - represents a deletion log entry
 */
export interface DbResponseDeletion {
  id: string;
  survey_id: string;
  participant_id: string | null;
  participant_email: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
  responses_count: number;
  deleted_at: string | null;
  responses_backup: Json | null;
}

// Export Json type so it can be used by other files
export type { Json };
