import { getSupabaseClient } from '../shared/supabase'
import { DuplicateNameError } from './errors'

export type Ledger = 'account' | 'card'

export type FinanceAccount = {
  id: string
  name: string
  institution: string | null
  openingBalanceCents: number
  balanceCents: number
}

export type FinanceCategory = {
  id: string
  name: string
  ledger: Ledger
  isSystem: boolean
}

export type FinanceOverview = {
  accounts: FinanceAccount[]
  accountCategories: FinanceCategory[]
  cardCategories: FinanceCategory[]
}

export type CheckingAccountInput = {
  name: string
  institution: string | null
  openingBalanceCents: number
}

type DatabaseError = { message: string; code?: string }
type RawAccountBalance = { id: string; name: string; institution: string | null; opening_balance_cents: number; balance_cents: number | string }
type RawCategory = { id: string; name: string; is_system?: boolean }

function requireClient() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase is not configured.')
  }
  return client
}

async function requireUserId() {
  const client = requireClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) {
    throw new Error('The authenticated user could not be resolved.')
  }
  return { client, userId: data.user.id }
}

function throwIfError(error: DatabaseError | null) {
  if (error?.code === '23505') {
    throw new DuplicateNameError()
  }
  if (error) {
    throw new Error(error.message)
  }
}

export async function loadFinanceOverview(): Promise<FinanceOverview> {
  const client = requireClient()
  const [accountResult, accountCategoryResult, cardCategoryResult] = await Promise.all([
    client.rpc('get_checking_account_balances'),
    client.from('account_categories').select('id, name, is_system').is('archived_at', null).order('name'),
    client.from('card_categories').select('id, name').is('archived_at', null).order('name'),
  ]) as unknown as [
    { data: RawAccountBalance[] | null; error: DatabaseError | null },
    { data: RawCategory[] | null; error: DatabaseError | null },
    { data: RawCategory[] | null; error: DatabaseError | null },
  ]

  throwIfError(accountResult.error)
  throwIfError(accountCategoryResult.error)
  throwIfError(cardCategoryResult.error)

  return {
    accounts: (accountResult.data ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      institution: account.institution,
      openingBalanceCents: account.opening_balance_cents,
      balanceCents: Number(account.balance_cents),
    })),
    accountCategories: (accountCategoryResult.data ?? []).map((category) => ({ id: category.id, name: category.name, ledger: 'account', isSystem: category.is_system === true })),
    cardCategories: (cardCategoryResult.data ?? []).map((category) => ({ id: category.id, name: category.name, ledger: 'card', isSystem: false })),
  }
}

export async function createCheckingAccount(input: CheckingAccountInput): Promise<void> {
  const { client, userId } = await requireUserId()
  const { error } = await client.from('checking_accounts').insert({
    user_id: userId,
    name: input.name,
    institution: input.institution,
    opening_balance_cents: input.openingBalanceCents,
  })
  throwIfError(error)
}

export async function updateCheckingAccount(id: string, input: CheckingAccountInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('checking_accounts').update({
    name: input.name,
    institution: input.institution,
    opening_balance_cents: input.openingBalanceCents,
  }).eq('id', id).is('archived_at', null).select('id').single()
  throwIfError(error)
}

export async function archiveCheckingAccount(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('checking_accounts').update({ archived_at: new Date().toISOString() }).eq('id', id).is('archived_at', null).select('id').single()
  throwIfError(error)
}

function categoryTable(ledger: Ledger) {
  return ledger === 'account' ? 'account_categories' : 'card_categories'
}

export async function createCategory(ledger: Ledger, name: string): Promise<void> {
  const { client, userId } = await requireUserId()
  const { error } = await client.from(categoryTable(ledger)).insert({ user_id: userId, name })
  throwIfError(error)
}

export async function renameCategory(ledger: Ledger, id: string, name: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from(categoryTable(ledger)).update({ name }).eq('id', id).is('archived_at', null).select('id').single()
  throwIfError(error)
}

export async function archiveCategory(ledger: Ledger, id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from(categoryTable(ledger)).update({ archived_at: new Date().toISOString() }).eq('id', id).is('archived_at', null).select('id').single()
  throwIfError(error)
}
