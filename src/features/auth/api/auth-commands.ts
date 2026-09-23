import { getSupabaseClient } from '@/lib/supabase';
import { AuthConfigurationError, AuthNetworkError } from '@/shared/errors/auth-errors';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new AuthConfigurationError('Supabase is not configured.');
  return client;
}

export async function signUpAccount(name: string, email: string, password: string): Promise<boolean> {
  const client = requireClient();
  let result: Awaited<ReturnType<typeof client.auth.signUp>>;
  try {
    result = await client.auth.signUp({ email, password, options: { data: { name } } });
  } catch {
    throw new AuthNetworkError('Sign-up request failed.');
  }
  if (result.error) throw result.error;
  return Boolean(result.data.session);
}

export async function signInAccount(email: string, password: string): Promise<void> {
  const client = requireClient();
  let result: Awaited<ReturnType<typeof client.auth.signInWithPassword>>;
  try {
    result = await client.auth.signInWithPassword({ email, password });
  } catch {
    throw new AuthNetworkError('Sign-in request failed.');
  }
  if (result.error) throw result.error;
}

export async function signOutAccount(): Promise<void> {
  const client = requireClient();
  let result: Awaited<ReturnType<typeof client.auth.signOut>>;
  try {
    result = await client.auth.signOut({ scope: 'local' });
  } catch {
    throw new AuthNetworkError('Sign-out request failed.');
  }
  if (result.error) throw result.error;
}
