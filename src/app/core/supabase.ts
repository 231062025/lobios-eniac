import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/** null quando a anon key ainda não foi configurada (modo demonstração). */
export const supabase: SupabaseClient | null = environment.supabaseAnonKey
  ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
  : null;
