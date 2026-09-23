import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadAccountActivity } from './load-account-activity';

const getSupabaseClient = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase', () => ({ getSupabaseClient }));

const accountId = '11111111-1111-4111-8111-111111111111';

beforeEach(() => vi.clearAllMocks());

describe('loadAccountActivity', () => {
  it('requests only the selected account and its transactions in newest-first order with a stable ID tie-breaker', async () => {
    const accountEq = vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Conta' }, error: null }),
    });
    const accountQuery = { select: vi.fn().mockReturnValue({ eq: accountEq }) };
    const secondOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const firstOrder = vi.fn().mockReturnValue({ order: secondOrder });
    const transactionEq = vi.fn().mockReturnValue({ order: firstOrder });
    const transactionQuery = { select: vi.fn().mockReturnValue({ eq: transactionEq }) };
    getSupabaseClient.mockReturnValue({
      from: (table: string) => (table === 'checking_accounts' ? accountQuery : transactionQuery),
    });

    const result = await loadAccountActivity(accountId);

    expect(result).toEqual({ accountName: 'Conta', transactions: [] });
    expect(accountEq).toHaveBeenCalledWith('id', accountId);
    expect(transactionEq).toHaveBeenCalledWith('checking_account_id', accountId);
    expect(firstOrder).toHaveBeenCalledWith('occurred_on', { ascending: false });
    expect(secondOrder).toHaveBeenCalledWith('id', { ascending: false });
  });
});
