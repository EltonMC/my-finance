import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type AppProvidersProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
