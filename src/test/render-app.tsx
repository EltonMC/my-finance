import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/AppProviders';
import { createQueryClient } from '@/lib/query-client';

// Transitional helper for the existing behavior suite while its screens move to routes.
export function renderApp(ui: ReactElement) {
  const queryClient = createQueryClient();
  const result = render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AppProviders>,
  );
  return { ...result, queryClient };
}
