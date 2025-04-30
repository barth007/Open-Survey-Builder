
import { Json } from './database';

/**
 * Database Survey type - matches the structure in Supabase
 */
export interface DbSurvey {
  id: string;
  name: string;
  description: string | null;
  is_published: boolean | null;
  questions: Json | null;
  folder_id: string | null;
  created_at: string | null;
  user_id: string | null;
}

/**
 * Database Survey Response type - matches the structure in Supabase
 */
export interface DbSurveyResponse {
  id: string;
  survey_id: string | null;
  answers: Json;
  submitted_at: string | null;
}
