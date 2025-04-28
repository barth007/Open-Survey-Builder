export type Database = {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string; // Assuming id is a UUID
            avatar_url: string | null;
            full_name: string | null;
          };
          Insert: {
            id: string;
            avatar_url?: string | null;
            full_name?: string | null;
          };
          Update: {
            avatar_url?: string | null;
            full_name?: string | null;
          };
        };
      };
      Views: {};
      Functions: {};
      Enums: {};
      CompositeTypes: {};
    };
  };
  