import { useQuery } from '@tanstack/react-query';
import { loadAccounts } from '../api/account-repository';

export const accountsKey = ['accounts', 'list'] as const;

export function useAccounts() {
  return useQuery({ queryKey: accountsKey, queryFn: loadAccounts, retry: false });
}
