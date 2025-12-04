import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export interface Session {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string | null;  // Peut être null au départ
  name: string;
  joined_at: string;
}