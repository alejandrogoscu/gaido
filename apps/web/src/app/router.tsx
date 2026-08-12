import { Navigate, type RouteObject, createBrowserRouter } from 'react-router-dom'

import { AuthPage } from '../features/auth/AuthPage'
import {
  RequireAuthenticated,
  RequireGuest,
} from '../features/auth/SessionGuards'
import { HomePage } from '../features/home/HomePage'
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout/AuthenticatedLayout'
import { PublicLayout } from '../layouts/PublicLayout/PublicLayout'

export const appRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: '/login', element: <AuthPage mode="login" /> },
          { path: '/register', element: <AuthPage mode="register" /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuthenticated />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [{ index: true, element: <HomePage /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

export const appRouter = createBrowserRouter(appRoutes)
