
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          avatar_url: string | null;
          full_name: string | null;
          bio: string | null;
          website: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          avatar_url?: string | null;
          full_name?: string | null;
          bio?: string | null;
          website?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          bio?: string | null;
          website?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      survey_responses: {
        Row: {
          answers: Json;
          id: string;
          submitted_at: string | null;
          survey_id: string | null;
        };
        Insert: {
          answers: Json;
          id?: string;
          submitted_at?: string | null;
          survey_id?: string | null;
        };
        Update: {
          answers?: Json;
          id?: string;
          submitted_at?: string | null;
          survey_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey";
            columns: ["survey_id"];
            isOneToOne: false;
            referencedRelation: "surveys";
            referencedColumns: ["id"];
          }
        ];
      };
      surveys: {
        Row: {
          created_at: string | null;
          description: string | null;
          folder_id: string | null;
          id: string;
          is_published: boolean | null;
          name: string;
          questions: Json | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          folder_id?: string | null;
          id?: string;
          is_published?: boolean | null;
          name: string;
          questions?: Json | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          folder_id?: string | null;
          id?: string;
          is_published?: boolean | null;
          name?: string;
          questions?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "surveys_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type DefaultSchema = Database[Extract<keyof Database, "public">];

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
    : never;

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
    : never;

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
    : never;

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
    : never;

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
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
