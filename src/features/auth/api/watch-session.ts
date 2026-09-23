import { getSupabaseClient } from '@/lib/supabase';

export function watchSession(onChange: (userId: string | null) => void): () => void {
  const client = getSupabaseClient();
  if (!client || typeof client.auth.onAuthStateChange !== 'function') return () => undefined;
  const { data } = client.auth.onAuthStateChange((_event, session) => onChange(session?.user.id ?? null));
  return () => data.subscription.unsubscribe();
}
