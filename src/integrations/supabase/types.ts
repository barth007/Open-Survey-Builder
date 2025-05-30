export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      response_deletions: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          participant_email: string | null
          participant_id: string | null
          responses_backup: Json | null
          responses_count: number
          survey_id: string
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          participant_email?: string | null
          participant_id?: string | null
          responses_backup?: Json | null
          responses_count: number
          survey_id: string
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          participant_email?: string | null
          participant_id?: string | null
          responses_backup?: Json | null
          responses_count?: number
          survey_id?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answers: Json
          deleted_at: string | null
          id: string
          metadata: Json | null
          participant_email: string | null
          participant_id: string | null
          submitted_at: string | null
          survey_id: string | null
        }
        Insert: {
          answers: Json
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          participant_email?: string | null
          participant_id?: string | null
          submitted_at?: string | null
          survey_id?: string | null
        }
        Update: {
          answers?: Json
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          participant_email?: string | null
          participant_id?: string | null
          submitted_at?: string | null
          survey_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string | null
          description: string | null
          folder_id: string | null
          id: string
          is_published: boolean | null
          name: string
          order: number | null
          public_code: string | null
          questions: Json | null
          redirect_url: string | null
          team_id: string | null
          thank_you_button_text: string | null
          thank_you_message: string | null
          thank_you_title: string | null
          user_id: string | null
          welcome_button_text: string | null
          welcome_instructions: string | null
          welcome_message: string | null
          welcome_title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          order?: number | null
          public_code?: string | null
          questions?: Json | null
          redirect_url?: string | null
          team_id?: string | null
          thank_you_button_text?: string | null
          thank_you_message?: string | null
          thank_you_title?: string | null
          user_id?: string | null
          welcome_button_text?: string | null
          welcome_instructions?: string | null
          welcome_message?: string | null
          welcome_title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          order?: number | null
          public_code?: string | null
          questions?: Json | null
          redirect_url?: string | null
          team_id?: string | null
          thank_you_button_text?: string | null
          thank_you_message?: string | null
          thank_you_title?: string | null
          user_id?: string | null
          welcome_button_text?: string | null
          welcome_instructions?: string | null
          welcome_message?: string | null
          welcome_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_code: string
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_code: string
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_code?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_team: {
        Args: { team_id_param: string }
        Returns: boolean
      }
      delete_responses_by_participant: {
        Args: {
          p_survey_id: string
          p_participant_id?: string
          p_participant_email?: string
          p_soft_delete?: boolean
          p_deletion_reason?: string
        }
        Returns: number
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_random_string: {
        Args: { length: number }
        Returns: string
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_team_admin: {
        Args: { team_id_param: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { team_id_param: string }
        Returns: boolean
      }
      is_team_owner: {
        Args: { team_id: string; user_id?: string } | { team_id_param: string }
        Returns: boolean
      }
      process_team_invitation: {
        Args: { invitation_code: string }
        Returns: string
      }
      user_is_team_admin: {
        Args: { team_id_param: string; user_id_param: string }
        Returns: boolean
      }
      user_is_team_member: {
        Args: { team_id_param: string; user_id_param: string }
        Returns: boolean
      }
      user_owns_team: {
        Args: { team_id_param: string; user_id_param: string }
        Returns: boolean
      }
      validate_auth_session: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
