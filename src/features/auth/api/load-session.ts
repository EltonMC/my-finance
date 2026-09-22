import { getSupabaseClient } from '@/lib/supabase';

export async function loadSession(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return Boolean(data.session);
}
