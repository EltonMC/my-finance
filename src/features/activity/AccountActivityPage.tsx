import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { userErrorMessageKey } from '@/shared/errors/user-error-message-key';
import { translate } from '@/shared/i18n/translate';
import { AccountActivityRow } from './components/AccountActivityRow';
import { useAccountActivity } from './hooks/use-account-activity';

const accountIdSchema = z.uuid();

export function AccountActivityPage() {
  const navigate = useNavigate();
  const { accountId: untrustedAccountId } = useParams();
  const parsedAccountId = accountIdSchema.safeParse(untrustedAccountId);
  const accountId = parsedAccountId.success ? parsedAccountId.data : null;
  const activity = useAccountActivity(accountId);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!activity.isPending || accountId === null) titleRef.current?.focus();
  }, [activity.isPending, accountId]);

  const accountName = activity.data?.accountName;
  const missing = accountId === null || (!activity.isPending && activity.data === null);

  return (
    <main className="app-shell">
      <header className="topbar">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          {translate('navigation.back')}
        </button>
        <h1 ref={titleRef} tabIndex={-1}>
          {accountName ? translate('activity.title', { name: accountName }) : translate('navigation.activity')}
        </h1>
      </header>
      {missing ? <p>{translate('activity.notFound')}</p> : null}
      {!missing && activity.isPending ? <p role="status">{translate('activity.loading')}</p> : null}
      {!missing && activity.isError ? (
        <div className="inline-error">
          <p role="alert" className="form-error">
            {translate(userErrorMessageKey(activity.error, 'load-activity'))}
          </p>
          <button type="button" className="secondary-button" onClick={() => void activity.refetch()}>
            {translate('activity.retry')}
          </button>
        </div>
      ) : null}
      {!missing && activity.data?.transactions.length === 0 ? (
        <p className="empty-state">{translate('activity.empty')}</p>
      ) : null}
      {!missing && activity.data && activity.data.transactions.length > 0 ? (
        <ol className="activity-list">
          {activity.data.transactions.map((transaction) => (
            <AccountActivityRow transaction={transaction} key={transaction.id} />
          ))}
        </ol>
      ) : null}
    </main>
  );
}
