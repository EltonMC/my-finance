import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: false },
      mutations: { retry: false },
    },
  });
}

export function removePrivateQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: ['accounts'] });
  queryClient.removeQueries({ queryKey: ['categories'] });
}
