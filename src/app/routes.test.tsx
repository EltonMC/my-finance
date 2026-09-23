import { act, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadAccounts } from '@/features/accounts/api/account-repository';
import { translate } from '@/shared/i18n/translate';
import { expectNoAccessibilityViolations } from '@/test/accessibility';
import { renderRoute } from '@/test/render';
import { RouteErrorPage } from './RouteErrorPage';

const loadSession = vi.hoisted(() => vi.fn());
const watchSession = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/api/load-session', () => ({ loadSession }));
vi.mock('@/features/auth/api/watch-session', () => ({ watchSession }));
vi.mock('@/features/accounts/api/account-repository', () => ({ loadAccounts: vi.fn() }));
vi.mock('@/features/categories/api/category-repository', () => ({
  loadCategories: vi.fn().mockResolvedValue({ accountCategories: [], cardCategories: [] }),
}));

let emitSession: (userId: string | null) => void;
beforeEach(() => {
  loadSession.mockResolvedValue(false);
  vi.mocked(loadAccounts).mockReset().mockResolvedValue([]);
  watchSession.mockImplementation((callback: (userId: string | null) => void) => {
    emitSession = callback;
    return () => undefined;
  });
});

describe('application routes', () => {
  it('helps a person recover from an unknown address', async () => {
    const { container, user } = renderRoute('/missing-page');

    expect(screen.getByRole('heading', { name: translate('navigation.notFoundTitle') })).toBeVisible();
    await expectNoAccessibilityViolations(container);
    await user.click(screen.getByRole('link', { name: translate('navigation.home') }));
    expect(await screen.findByRole('heading', { name: translate('auth.signInTitle') })).toBeVisible();
    expect(container).toBeInTheDocument();
  });

  it('opens settings at a stable address for an authenticated person', async () => {
    loadSession.mockResolvedValue(true);
    const { container, router } = renderRoute('/settings');

    expect(await screen.findByRole('heading', { name: translate('settings.title') })).toBeVisible();
    expect(router.state.location.pathname).toBe('/settings');
    await expectNoAccessibilityViolations(container);
  });

  it('updates the address when moving between overview and settings', async () => {
    loadSession.mockResolvedValue(true);
    const { router, user } = renderRoute('/');

    await user.click(await screen.findByRole('button', { name: translate('navigation.settings') }));
    expect(router.state.location.pathname).toBe('/settings');
    await user.click(screen.getByRole('button', { name: translate('navigation.back') }));
    expect(router.state.location.pathname).toBe('/');
  });

  it('removes private data when a refreshed session is no longer valid', async () => {
    loadSession.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { queryClient } = renderRoute('/');

    expect(await screen.findByRole('heading', { name: translate('home.title') })).toBeVisible();
    await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });

    expect(await screen.findByRole('heading', { name: translate('auth.signInTitle') })).toBeVisible();
    expect(screen.queryByRole('heading', { name: translate('home.title') })).not.toBeInTheDocument();
  });

  it('closes a private screen after a sign-out event from another tab', async () => {
    loadSession.mockResolvedValue(true);
    renderRoute('/');
    expect(await screen.findByRole('heading', { name: translate('home.title') })).toBeVisible();

    act(() => emitSession(null));

    expect(await screen.findByRole('heading', { name: translate('auth.signInTitle') })).toBeVisible();
  });

  it('waits for session verification before offering sign-in', async () => {
    loadSession.mockReturnValue(new Promise(() => undefined));
    renderRoute('/');

    expect(screen.getByRole('status')).toHaveTextContent(translate('auth.checkingSession'));
    expect(screen.queryByRole('heading', { name: translate('auth.signInTitle') })).not.toBeInTheDocument();
  });

  it('replaces private data when the session changes directly to another user', async () => {
    loadSession.mockResolvedValue(true);
    vi.mocked(loadAccounts)
      .mockResolvedValueOnce([
        { id: 'account-a', name: 'Conta de Ana', institution: null, openingBalanceCents: 0, balanceCents: 0 },
      ])
      .mockResolvedValueOnce([
        { id: 'account-b', name: 'Conta de Bruno', institution: null, openingBalanceCents: 0, balanceCents: 0 },
      ]);
    renderRoute('/');
    act(() => emitSession('user-a'));
    expect(await screen.findByText('Conta de Ana')).toBeVisible();

    act(() => emitSession('user-b'));

    expect(screen.queryByText('Conta de Ana')).not.toBeInTheDocument();
    expect(await screen.findByText('Conta de Bruno')).toBeVisible();
  });

  it('provides an accessible recovery path when a route crashes', async () => {
    function BrokenScreen(): never {
      throw new Error('Private technical detail');
    }
    const { container } = renderRoute('/broken', {
      routes: [{ path: '/broken', element: <BrokenScreen />, errorElement: <RouteErrorPage /> }],
    });

    expect(await screen.findByRole('heading', { name: translate('errors.title') })).toBeVisible();
    expect(screen.queryByText('Private technical detail')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: translate('navigation.home') })).toBeVisible();
    await expectNoAccessibilityViolations(container);
  });
});
