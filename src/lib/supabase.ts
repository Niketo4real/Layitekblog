import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://lefypsyxdrxgwwjwtqxi.supabase.co';

export const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/$/, '');

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZnlwc3l4ZHJ4Z3d3and0cXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NDY4NzYsImV4cCI6MjEwOTMyMjg3Nn0.EdtACfmTVW7avN2oDUva5Sa2VDx2GTpouAJ_nOKU0HU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
