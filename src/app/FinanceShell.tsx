import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { FinanceAccount } from '@/features/accounts/api/account-repository';
import { AccountDialog } from '@/features/accounts/components/AccountDialog';
import { useAccountCommand } from '@/features/accounts/hooks/use-account-command';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import type { FinanceCategory, Ledger } from '@/features/categories/api/category-repository';
import { CategoryDialog } from '@/features/categories/components/CategoryDialog';
import { CategorySection } from '@/features/categories/components/CategorySection';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useCategoryCommand } from '@/features/categories/hooks/use-category-command';
import { type ErrorOperation, userErrorMessageKey } from '@/shared/errors/user-error-message-key';
import { formatBrl } from '@/shared/formatting/money';
import { translate } from '@/shared/i18n/translate';
import { ArchiveDialog } from '@/shared/ui/ArchiveDialog';
import { LoadError } from './components/LoadError';
import { PageMessages } from './components/PageMessages';

export function FinanceShell({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const view = useLocation().pathname === '/settings' ? 'settings' : 'overview';
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const accounts = useAccounts();
  const categories = useCategories();
  const accountCommand = useAccountCommand();
  const categoryCommand = useCategoryCommand();
  const overview = {
    accounts: accounts.data ?? [],
    accountCategories: categories.data?.accountCategories ?? [],
    cardCategories: categories.data?.cardCategories ?? [],
  };
  const loading = accounts.isPending || categories.isPending;
  const isError = accounts.isError || categories.isError;
  const saving = accountCommand.isPending || categoryCommand.isPending;
  const loadError = isError ? translate(userErrorMessageKey(null, 'load-finance')) : null;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [accountEditor, setAccountEditor] = useState<FinanceAccount | 'new' | null>(null);
  const [categoryEditor, setCategoryEditor] = useState<{ ledger: Ledger; category?: FinanceCategory } | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<
    | { kind: 'account'; id: string; label: string }
    | { kind: 'category'; id: string; label: string; ledger: Ledger }
    | null
  >(null);
  const overviewTitleRef = useRef<HTMLHeadingElement>(null);
  const settingsTitleRef = useRef<HTMLHeadingElement>(null);

  async function refreshOverview() {
    await Promise.all([accounts.refetch(), categories.refetch()]);
  }

  useEffect(() => {
    (view === 'settings' ? settingsTitleRef : overviewTitleRef).current?.focus();
  }, [view]);

  async function runMutation(action: () => Promise<void>, successMessage: string, operation: ErrorOperation) {
    setMutationError(null);
    setSavedStatus(null);
    try {
      await action();
      setAccountEditor(null);
      setCategoryEditor(null);
      setArchiveTarget(null);
      setSavedStatus(successMessage);
    } catch (error) {
      setMutationError(translate(userErrorMessageKey(error, operation)));
    }
  }

  function closeDialogs() {
    setAccountEditor(null);
    setCategoryEditor(null);
    setArchiveTarget(null);
    setMutationError(null);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await onSignOut();
    } catch (requestError) {
      setSignOutError(translate(userErrorMessageKey(requestError, 'sign-out')));
    } finally {
      setSigningOut(false);
    }
  }

  function renderSettings() {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button type="button" className="back-button" disabled={saving || signingOut} onClick={() => navigate('/')}>
            {translate('navigation.back')}
          </button>
          <div>
            <p className="eyebrow">{translate('settings.eyebrow')}</p>
            <h1 ref={settingsTitleRef} tabIndex={-1}>
              {translate('settings.title')}
            </h1>
          </div>
          <button type="button" className="secondary-button" disabled={signingOut || saving} onClick={handleSignOut}>
            {signingOut ? translate('home.signingOut') : translate('home.signOut')}
          </button>
        </header>
        <PageMessages
          signOutError={signOutError}
          savedStatus={savedStatus}
          mutationError={mutationError}
          showMutationError={!categoryEditor && !archiveTarget}
        />
        {loadError ? <LoadError onRetry={refreshOverview} /> : null}
        {!loadError ? (
          <>
            <CategorySection
              title={translate('categories.accountTitle')}
              addLabel={translate('categories.addAccount')}
              categories={overview?.accountCategories ?? []}
              loading={loading}
              onAdd={() => setCategoryEditor({ ledger: 'account' })}
              onRename={(category) => setCategoryEditor({ ledger: 'account', category })}
              onArchive={(category) =>
                setArchiveTarget({ kind: 'category', id: category.id, label: category.name, ledger: 'account' })
              }
            />
            <CategorySection
              title={translate('categories.cardTitle')}
              addLabel={translate('categories.addCard')}
              categories={overview?.cardCategories ?? []}
              loading={loading}
              onAdd={() => setCategoryEditor({ ledger: 'card' })}
              onRename={(category) => setCategoryEditor({ ledger: 'card', category })}
              onArchive={(category) =>
                setArchiveTarget({ kind: 'category', id: category.id, label: category.name, ledger: 'card' })
              }
            />
          </>
        ) : null}
        <nav className="bottom-navigation" aria-label={translate('navigation.main')}>
          <button type="button" onClick={() => navigate('/')}>
            {translate('navigation.overview')}
          </button>
          <button type="button">{translate('navigation.activity')}</button>
          <button type="button">{translate('navigation.cards')}</button>
          <button type="button" aria-current="page">
            {translate('navigation.settings')}
          </button>
        </nav>
        {categoryEditor ? (
          <CategoryDialog
            editor={categoryEditor}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onSave={(name) =>
              runMutation(
                () =>
                  categoryEditor.category
                    ? categoryCommand.mutateAsync({
                        kind: 'rename',
                        ledger: categoryEditor.ledger,
                        id: categoryEditor.category.id,
                        name,
                      })
                    : categoryCommand.mutateAsync({ kind: 'create', ledger: categoryEditor.ledger, name }),
                categoryEditor.category ? translate('categories.updated') : translate('categories.saved'),
                'save-category',
              )
            }
          />
        ) : null}
        {archiveTarget?.kind === 'category' ? (
          <ArchiveDialog
            label={archiveTarget.label}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onConfirm={() =>
              runMutation(
                () =>
                  categoryCommand.mutateAsync({ kind: 'archive', ledger: archiveTarget.ledger, id: archiveTarget.id }),
                translate('categories.archived'),
                'save-category',
              )
            }
          />
        ) : null}
      </main>
    );
  }

  function renderAccountDialogs() {
    return (
      <>
        {accountEditor ? (
          <AccountDialog
            account={accountEditor === 'new' ? null : accountEditor}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onSave={(input) =>
              runMutation(
                () =>
                  accountEditor === 'new'
                    ? accountCommand.mutateAsync({ kind: 'create', input })
                    : accountCommand.mutateAsync({ kind: 'update', id: accountEditor.id, input }),
                accountEditor === 'new' ? translate('accounts.saved') : translate('accounts.updated'),
                'save-account',
              )
            }
          />
        ) : null}
        {archiveTarget?.kind === 'account' ? (
          <ArchiveDialog
            label={archiveTarget.label}
            saving={saving}
            error={mutationError}
            onClose={closeDialogs}
            onConfirm={() =>
              runMutation(
                () => accountCommand.mutateAsync({ kind: 'archive', id: archiveTarget.id }),
                translate('accounts.archived'),
                'save-account',
              )
            }
          />
        ) : null}
      </>
    );
  }

  function renderOverview() {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">MyFinance</p>
            <h1 ref={overviewTitleRef} tabIndex={-1}>
              {translate('home.title')}
            </h1>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button"
              aria-label={translate('home.addAccount')}
              disabled={signingOut || loading}
              onClick={() => setAccountEditor('new')}
            >
              +
            </button>
            <button type="button" className="secondary-button" disabled={signingOut} onClick={handleSignOut}>
              {signingOut ? translate('home.signingOut') : translate('home.signOut')}
            </button>
          </div>
        </header>
        <PageMessages
          signOutError={signOutError}
          savedStatus={savedStatus}
          mutationError={mutationError}
          showMutationError={!accountEditor && !archiveTarget}
        />
        <section className="attention-card" aria-labelledby="attention-title">
          <p className="eyebrow">{translate('home.attentionEyebrow')}</p>
          <h2 id="attention-title">{translate('home.attentionTitle')}</h2>
          <p>{translate('home.recurringPlaceholder')}</p>
        </section>
        <section className="ledger-section" aria-labelledby="accounts-title">
          <div className="section-heading">
            <h2 id="accounts-title">{translate('home.accountsTitle')}</h2>
            <button type="button" className="text-button" disabled={loading} onClick={() => setAccountEditor('new')}>
              {translate('home.addAccount')}
            </button>
          </div>
          {loading ? (
            <p className="muted" role="status">
              {translate('home.loading')}
            </p>
          ) : null}
          {loadError ? <LoadError onRetry={refreshOverview} /> : null}
          {!loading && !loadError && overview?.accounts.length === 0 ? (
            <div className="empty-state">
              <p>{translate('home.emptyAccounts')}</p>
              <button type="button" className="secondary-button" onClick={() => setAccountEditor('new')}>
                {translate('home.addFirstAccount')}
              </button>
            </div>
          ) : null}
          <div className="account-list">
            {overview?.accounts.map((account) => (
              <article className="money-card" key={account.id}>
                <span>{account.name}</span>
                <strong>{formatBrl(account.balanceCents)}</strong>
                <small>{account.institution ?? translate('home.balanceLabel')}</small>
                <div className="card-actions">
                  <button
                    type="button"
                    className="text-button"
                    aria-label={translate('accounts.edit', { name: account.name })}
                    onClick={() => setAccountEditor(account)}
                  >
                    {translate('actions.edit')}
                  </button>
                  <button
                    type="button"
                    className="text-button danger-button"
                    aria-label={translate('accounts.archive', { name: account.name })}
                    onClick={() => setArchiveTarget({ kind: 'account', id: account.id, label: account.name })}
                  >
                    {translate('actions.archive')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="ledger-section" aria-labelledby="cards-title">
          <div className="section-heading">
            <h2 id="cards-title">{translate('home.cardsTitle')}</h2>
          </div>
          <div className="empty-state">
            <p>{translate('home.emptyCards')}</p>
            <small>{translate('home.cardsNext')}</small>
          </div>
        </section>
        <nav className="bottom-navigation" aria-label={translate('navigation.main')}>
          <button type="button" aria-current="page">
            {translate('navigation.overview')}
          </button>
          <button type="button">{translate('navigation.activity')}</button>
          <button type="button">{translate('navigation.cards')}</button>
          <button type="button" onClick={() => navigate('/settings')}>
            {translate('navigation.settings')}
          </button>
        </nav>
        {renderAccountDialogs()}
      </main>
    );
  }

  return view === 'settings' ? renderSettings() : renderOverview();
}
