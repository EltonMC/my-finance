import type { RouteObject } from 'react-router';
import { App } from './App';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorPage } from './RouteErrorPage';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <App /> },
      { path: 'settings', element: <App /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
