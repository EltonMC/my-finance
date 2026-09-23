import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckingAccountInput } from '../api/account-repository';
import { archiveCheckingAccount, createCheckingAccount, updateCheckingAccount } from '../api/account-repository';
import { accountsKey } from './use-accounts';

type AccountCommand =
  | { kind: 'create'; input: CheckingAccountInput }
  | { kind: 'update'; id: string; input: CheckingAccountInput }
  | { kind: 'archive'; id: string };

export function useAccountCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: AccountCommand) => {
      if (command.kind === 'create') return createCheckingAccount(command.input);
      if (command.kind === 'update') return updateCheckingAccount(command.id, command.input);
      return archiveCheckingAccount(command.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsKey });
    },
  });
}
