import { getSupabaseClient } from '@/lib/supabase';
import { throwIfDatabaseError } from '@/shared/errors/database-error';

export type Ledger = 'account' | 'card';

export type FinanceCategory = {
  id: string;
  name: string;
  ledger: Ledger;
  isSystem: boolean;
};

export type FinanceCategories = {
  accountCategories: FinanceCategory[];
  cardCategories: FinanceCategory[];
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

function categoryTable(ledger: Ledger) {
  return ledger === 'account' ? 'account_categories' : 'card_categories';
}

export async function loadCategories(): Promise<FinanceCategories> {
  const client = requireClient();
  const [accountResult, cardResult] = await Promise.all([
    client.from('account_categories').select('id, name, is_system').is('archived_at', null).order('name'),
    client.from('card_categories').select('id, name').is('archived_at', null).order('name'),
  ]);
  throwIfDatabaseError(accountResult.error);
  throwIfDatabaseError(cardResult.error);
  return {
    accountCategories: (accountResult.data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      ledger: 'account',
      isSystem: category.is_system === true,
    })),
    cardCategories: (cardResult.data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      ledger: 'card',
      isSystem: false,
    })),
  };
}

export async function createCategory(ledger: Ledger, name: string): Promise<void> {
  const { client, userId } = await requireUserId();
  const { error } = await client.from(categoryTable(ledger)).insert({ user_id: userId, name });
  throwIfDatabaseError(error);
}

export async function renameCategory(ledger: Ledger, id: string, name: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from(categoryTable(ledger))
    .update({ name })
    .eq('id', id)
    .is('archived_at', null)
    .select('id')
    .single();
  throwIfDatabaseError(error);
}

export async function archiveCategory(ledger: Ledger, id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from(categoryTable(ledger))
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .is('archived_at', null)
    .select('id')
    .single();
  throwIfDatabaseError(error);
}
