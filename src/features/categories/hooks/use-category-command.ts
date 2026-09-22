import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ledger } from '../api/category-repository';
import { archiveCategory, createCategory, renameCategory } from '../api/category-repository';
import { categoriesKey } from './use-categories';

type CategoryCommand =
  | { kind: 'create'; ledger: Ledger; name: string }
  | { kind: 'rename'; ledger: Ledger; id: string; name: string }
  | { kind: 'archive'; ledger: Ledger; id: string };

export function useCategoryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: CategoryCommand) => {
      if (command.kind === 'create') return createCategory(command.ledger, command.name);
      if (command.kind === 'rename') return renameCategory(command.ledger, command.id, command.name);
      return archiveCategory(command.ledger, command.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKey });
    },
  });
}
