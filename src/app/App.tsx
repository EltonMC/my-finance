import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AccountActivityPage } from '@/features/activity/AccountActivityPage';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { useSignOut } from '@/features/auth/hooks/use-auth-command';
import { useSession } from '@/features/auth/hooks/use-session';
import { removePrivateQueries } from '@/lib/query-client';
import { translate } from '@/shared/i18n/translate';
import { FinanceShell } from './FinanceShell';
import './app.css';

type AppProps = {
  initialSession?: boolean;
};

export function App({ initialSession = false }: AppProps) {
  const { accountId } = useParams();
  const [authenticated, setAuthenticated] = useState(initialSession);
  const queryClient = useQueryClient();
  const { mutateAsync: signOut } = useSignOut();
  const { data: hasSession, isPending: checkingSession, userId } = useSession(!initialSession);

  useEffect(() => {
    if (hasSession === undefined) return;
    if (!hasSession) removePrivateQueries(queryClient);
    setAuthenticated(hasSession);
  }, [hasSession, queryClient]);

  if (!authenticated && !initialSession && checkingSession) {
    return (
      <main className="auth-shell">
        <p role="status">{translate('auth.checkingSession')}</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <AuthScreen
        onSignedIn={async () => {
          await queryClient.cancelQueries({ queryKey: ['auth', 'session'] });
          queryClient.setQueryData(['auth', 'session'], true);
          setAuthenticated(true);
        }}
      />
    );
  }

  if (accountId !== undefined) return <AccountActivityPage key={userId ?? 'session'} />;

  return (
    <FinanceShell
      key={userId ?? 'session'}
      onSignOut={async () => {
        await signOut();
        queryClient.clear();
        queryClient.setQueryData(['auth', 'session'], false);
        setAuthenticated(false);
      }}
    />
  );
}
