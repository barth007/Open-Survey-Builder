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
          answers: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
          id: string;
          submitted_at: string | null;
          survey_id: string | null;
        };
        Insert: {
          answers: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
          id?: string;
          submitted_at?: string | null;
          survey_id?: string | null;
        };
        Update: {
          answers?: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
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
          questions: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          folder_id?: string | null;
          id?: string;
          is_published?: boolean | null;
          name: string;
          questions?: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          folder_id?: string | null;
          id?: string;
          is_published?: boolean | null;
          name?: string;
          questions?: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: string | number | boolean | null | { [key: string]: any; }; }; }; }; };
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
      team_invitations: {
        Row: {
          accepted: boolean | null;
          email: string;
          id: string;
          invited_at: string;
          role: string;
          team_id: string;
        };
        Insert: {
          accepted?: boolean | null;
          email: string;
          id?: string;
          invited_at?: string;
          role: string;
          team_id: string;
        };
        Update: {
          accepted?: boolean | null;
          email?: string;
          id?: string;
          invited_at?: string;
          role?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_members: {
        Row: {
          email: string | null;
          id: string;
          joined_at: string | null;
          role: string;
          team_id: string | null;
          user_id: string | null;
        };
        Insert: {
          email?: string | null;
          id?: string;
          joined_at?: string | null;
          role?: string;
          team_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          joined_at?: string | null;
          role?: string;
          team_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_surveys: {
        Row: {
          id: string;
          survey_id: string;
          team_id: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          team_id: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_surveys_survey_id_fkey";
            columns: ["survey_id"];
            isOneToOne: false;
            referencedRelation: "surveys";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_surveys_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
