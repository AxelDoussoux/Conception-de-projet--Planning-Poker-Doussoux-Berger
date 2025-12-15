import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
  throw new Error("Erreur : Les variables d'environnement Supabase sont manquantes.");
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

export interface Votes {
  id: string;
  task_id: string;
  participant_id: string;
  value: number;
  voted_at: string;
}

export interface Tasks {
  id: string;
  session_id: string;
  title: string;
  description: string;
  is_current: boolean;
  created_at: string;
}