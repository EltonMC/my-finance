import type { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import { throwIfDatabaseError } from '@/shared/errors/database-error';

export type AccountActivity = {
  accountName: string;
  transactions: {
    id: string;
    occurredOn: string;
    description: string;
    categoryName: string;
    transactionType: Database['public']['Enums']['account_transaction_type'];
    amountCents: number;
  }[];
};

export async function loadAccountActivity(accountId: string): Promise<AccountActivity | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');

  const accountResult = await client.from('checking_accounts').select('name').eq('id', accountId).maybeSingle();
  throwIfDatabaseError(accountResult.error);
  if (!accountResult.data) return null;

  const transactionResult = await client
    .from('account_transactions')
    .select('id, occurred_on, description, amount_cents, transaction_type, account_categories(name)')
    .eq('checking_account_id', accountId)
    .order('occurred_on', { ascending: false })
    .order('id', { ascending: false });
  throwIfDatabaseError(transactionResult.error);

  return {
    accountName: accountResult.data.name,
    transactions: (transactionResult.data ?? []).map((transaction) => ({
      id: transaction.id,
      occurredOn: transaction.occurred_on,
      description: transaction.description,
      categoryName: transaction.account_categories.name,
      transactionType: transaction.transaction_type,
      amountCents: transaction.amount_cents,
    })),
  };
}
