import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database'; // Import the custom type you defined

// Initialize the Supabase client with the URL and public anon key from your environment variables
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // The URL of your Supabase project
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // The anon key for public access
);
