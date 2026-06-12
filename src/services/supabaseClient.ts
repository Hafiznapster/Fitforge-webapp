import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy';

if (supabaseUrl === 'https://dummy.supabase.co') {
  console.warn('Supabase credentials not found. Cloud features will fail gracefully.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
