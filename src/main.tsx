import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppProviders } from './app/AppProviders';
import { appRoutes } from './app/routes';
import { createQueryClient } from './lib/query-client';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Application root element is missing.');
}

createRoot(root).render(
  <StrictMode>
    <AppProviders queryClient={createQueryClient()}>
      <RouterProvider router={createBrowserRouter(appRoutes)} />
    </AppProviders>
  </StrictMode>,
);
