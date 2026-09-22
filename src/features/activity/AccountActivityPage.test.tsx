import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { translate } from '@/shared/i18n/translate';
import { expectNoAccessibilityViolations } from '@/test/accessibility';
import { renderRoute } from '@/test/render';

const loadSession = vi.hoisted(() => vi.fn());
const loadAccounts = vi.hoisted(() => vi.fn());
const loadAccountActivity = vi.hoisted(() => vi.fn());
const accountId = '11111111-1111-4111-8111-111111111111';

vi.mock('@/features/auth/api/load-session', () => ({ loadSession }));
vi.mock('@/features/auth/api/watch-session', () => ({ watchSession: () => () => undefined }));
vi.mock('@/features/accounts/api/account-repository', () => ({ loadAccounts }));
vi.mock('@/features/categories/api/category-repository', () => ({
  loadCategories: vi.fn().mockResolvedValue({ accountCategories: [], cardCategories: [] }),
}));
vi.mock('@/features/activity/api/load-account-activity', () => ({ loadAccountActivity }));

beforeEach(() => {
  vi.clearAllMocks();
  loadSession.mockResolvedValue(true);
  loadAccounts.mockResolvedValue([
    { id: accountId, name: 'Conta principal', institution: null, openingBalanceCents: 0, balanceCents: 0 },
  ]);
  loadAccountActivity.mockResolvedValue({ accountName: 'Conta principal', transactions: [] });
});

describe('account activity', () => {
  it('opens an account history from the overview and returns', async () => {
    const { router, user } = renderRoute('/');

    await user.click(
      await screen.findByRole('link', { name: translate('accounts.viewActivity', { name: 'Conta principal' }) }),
    );

    expect(router.state.location.pathname).toBe(`/accounts/${accountId}/activity`);
    expect(
      await screen.findByRole('heading', { name: translate('activity.title', { name: 'Conta principal' }) }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: translate('navigation.back') }));
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows date, archived category label, direction, amount, and system origin', async () => {
    loadAccountActivity.mockResolvedValue({
      accountName: 'Conta principal',
      transactions: [
        {
          id: 't2',
          occurredOn: '2026-09-21',
          description: 'Salário',
          categoryName: 'Trabalho',
          transactionType: 'income',
          amountCents: 350050,
        },
        {
          id: 't1',
          occurredOn: '2026-09-20',
          description: 'Fatura',
          categoryName: 'Pagamento de fatura',
          transactionType: 'invoice_payment',
          amountCents: 125030,
        },
      ],
    });
    const { container } = renderRoute(`/accounts/${accountId}/activity`);

    expect(
      await screen.findByRole('heading', { name: translate('activity.title', { name: 'Conta principal' }) }),
    ).toBeVisible();
    expect(screen.getByText('Salário')).toBeVisible();
    expect(screen.getByText('Trabalho')).toBeVisible();
    expect(screen.getByText('21/09/2026')).toBeVisible();
    expect(screen.getByText(translate('activity.income'))).toBeVisible();
    expect(screen.getByText('+ R$ 3.500,50')).toBeVisible();
    expect(screen.getAllByText(translate('activity.invoicePayment'))).toHaveLength(2);
    expect(screen.getByText(translate('activity.systemOrigin'))).toBeVisible();
    expect(screen.getByText('− R$ 1.250,30')).toBeVisible();
    await expectNoAccessibilityViolations(container);
  });

  it('shows a loading state followed by an empty state', async () => {
    let resolveActivity: (value: { accountName: string; transactions: [] }) => void = () => undefined;
    loadAccountActivity.mockReturnValue(
      new Promise((resolve) => {
        resolveActivity = resolve;
      }),
    );
    const { container } = renderRoute(`/accounts/${accountId}/activity`);

    expect(await screen.findByText(translate('activity.loading'))).toHaveAttribute('role', 'status');
    resolveActivity({ accountName: 'Conta principal', transactions: [] });
    expect(await screen.findByText(translate('activity.empty'))).toBeVisible();
    await expectNoAccessibilityViolations(container);
  });

  it('identifies a recurring bill payment as system-created', async () => {
    loadAccountActivity.mockResolvedValue({
      accountName: 'Conta principal',
      transactions: [
        {
          id: 't3',
          occurredOn: '2026-09-19',
          description: 'Aluguel',
          categoryName: 'Moradia',
          transactionType: 'recurring_bill_payment',
          amountCents: 80000,
        },
      ],
    });
    renderRoute(`/accounts/${accountId}/activity`);

    expect(await screen.findByText(translate('activity.recurringBillPayment'))).toBeVisible();
    expect(screen.getByText(translate('activity.systemOrigin'))).toBeVisible();
  });

  it('recovers from a read error without showing database details', async () => {
    loadAccountActivity.mockRejectedValueOnce(new Error('private table detail'));
    const { container, user } = renderRoute(`/accounts/${accountId}/activity`);

    expect(await screen.findByRole('alert')).toHaveTextContent(translate('activity.loadError'));
    expect(screen.queryByText('private table detail')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: translate('activity.retry') }));
    expect(await screen.findByText(translate('activity.empty'))).toBeVisible();
    await expectNoAccessibilityViolations(container);
  });

  it('does not query an invalid account address', async () => {
    const { container } = renderRoute('/accounts/not-an-id/activity');

    expect(await screen.findByText(translate('activity.notFound'))).toBeVisible();
    expect(loadAccountActivity).not.toHaveBeenCalled();
    await expectNoAccessibilityViolations(container);
  });

  it('treats an unowned account as missing', async () => {
    loadAccountActivity.mockResolvedValue(null);
    const { container } = renderRoute(`/accounts/${accountId}/activity`);

    expect(await screen.findByText(translate('activity.notFound'))).toBeVisible();
    expect(screen.queryByText('Conta principal')).not.toBeInTheDocument();
    await expectNoAccessibilityViolations(container);
  });

  it('keeps saved activity private from a signed-out visitor', async () => {
    loadSession.mockResolvedValue(false);
    renderRoute(`/accounts/${accountId}/activity`);

    expect(await screen.findByRole('heading', { name: translate('auth.signInTitle') })).toBeVisible();
    expect(loadAccountActivity).not.toHaveBeenCalled();
  });
});
