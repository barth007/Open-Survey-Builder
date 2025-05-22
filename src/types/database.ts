
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
  // Welcome page fields
  welcome_title: string | null;
  welcome_message: string | null;
  welcome_instructions: string | null;
  welcome_button_text: string | null;
  // Thank you page fields
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
  metadata: Json | null;
}

// Export Json type so it can be used by other files
export type { Json };
