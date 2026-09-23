import { useQuery } from '@tanstack/react-query';
import { loadAccountActivity } from '../api/load-account-activity';

export function useAccountActivity(accountId: string | null) {
  return useQuery({
    queryKey: ['activity', 'account', accountId],
    queryFn: () => loadAccountActivity(accountId ?? ''),
    enabled: accountId !== null,
    retry: false,
  });
}
