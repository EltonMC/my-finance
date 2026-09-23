import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import { AppProviders } from '@/app/AppProviders';
import { appRoutes } from '@/app/routes';

type RenderRouteOptions = { routes?: RouteObject[] };

export function renderRoute(path: string, { routes = appRoutes }: RenderRouteOptions = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  const result = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...result, user, router, queryClient };
}
