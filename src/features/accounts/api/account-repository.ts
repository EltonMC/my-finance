import { getSupabaseClient } from '@/lib/supabase';
import { throwIfDatabaseError } from '@/shared/errors/database-error';

export type FinanceAccount = {
  id: string;
  name: string;
  institution: string | null;
  openingBalanceCents: number;
  balanceCents: number;
};

export type CheckingAccountInput = {
  name: string;
  institution: string | null;
  openingBalanceCents: number;
};

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

async function requireUserId() {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('The authenticated user could not be resolved.');
  return { client, userId: data.user.id };
}

export async function loadAccounts(): Promise<FinanceAccount[]> {
  const client = requireClient();
  const { data, error } = await client.rpc('get_checking_account_balances');
  throwIfDatabaseError(error);
  return (data ?? []).map((account) => ({
    id: account.id,
    name: account.name,
    institution: account.institution,
    openingBalanceCents: account.opening_balance_cents,
    balanceCents: Number(account.balance_cents),
  }));
}

export async function createCheckingAccount(input: CheckingAccountInput): Promise<void> {
  const { client, userId } = await requireUserId();
  const { error } = await client.from('checking_accounts').insert({
    user_id: userId,
    name: input.name,
    institution: input.institution,
    opening_balance_cents: input.openingBalanceCents,
  });
  throwIfDatabaseError(error);
}

export async function updateCheckingAccount(id: string, input: CheckingAccountInput): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('checking_accounts')
    .update({
      name: input.name,
      institution: input.institution,
      opening_balance_cents: input.openingBalanceCents,
    })
    .eq('id', id)
    .is('archived_at', null)
    .select('id')
    .single();
  throwIfDatabaseError(error);
}

export async function archiveCheckingAccount(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('checking_accounts')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .is('archived_at', null)
    .select('id')
    .single();
  throwIfDatabaseError(error);
}
