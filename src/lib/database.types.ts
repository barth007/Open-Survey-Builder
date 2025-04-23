
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
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
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
        }
        Insert: {
          id?: string
          name: string
          folder_id?: string | null
          created_at?: string
          description?: string
          questions?: Json
          is_published?: boolean
        }
        Update: {
          id?: string
          name?: string
          folder_id?: string | null
          created_at?: string
          description?: string
          questions?: Json
          is_published?: boolean
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
    }
  }
}
