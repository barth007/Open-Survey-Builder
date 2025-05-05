
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          name: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          user_id?: string
        }
      }
      surveys: {
        Row: {
          id: string
          name: string
          folder_id: string | null
          created_at: string
          description: string
          questions: Json
          is_published: boolean
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          folder_id?: string | null
          created_at?: string
          description?: string
          questions?: Json
          is_published?: boolean
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          folder_id?: string | null
          created_at?: string
          description?: string
          questions?: Json
          is_published?: boolean
          user_id?: string
        }
      }
      survey_responses: {
        Row: {
          id: string
          survey_id: string
          answers: Json
          submitted_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          answers: Json
          submitted_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          answers?: Json
          submitted_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string
        }
      }
      team_surveys: {
        Row: {
          id: string
          team_id: string
          survey_id: string
        }
        Insert: {
          id?: string
          team_id: string
          survey_id: string
        }
        Update: {
          id?: string
          team_id?: string
          survey_id?: string
        }
      }
    }
  }
}
