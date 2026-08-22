import { Navigate, type RouteObject, createBrowserRouter } from 'react-router-dom'

import { AuthPage } from '../features/auth/AuthPage'
import {
  RequireAuthenticated,
  RequireGuest,
} from '../features/auth/SessionGuards'
import { HomePage } from '../features/home/HomePage'
import { GameDetailPage } from '../features/games/GameDetailPage'
import { GameLibraryPage } from '../features/games/GameLibraryPage'
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
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'videojuegos',
            HydrateFallback: VideoGamesOverviewFallback,
            lazy: async () => {
              const { VideoGamesOverviewPage } = await import(
                '../features/games/VideoGamesOverviewPage'
              )
              return { Component: VideoGamesOverviewPage }
            },
            handle: { hideAuthenticatedHeader: true },
          },
          {
            path: 'biblioteca/videojuegos',
            element: <GameLibraryPage />,
            handle: { hideAuthenticatedHeader: true },
          },
          {
            path: 'videojuegos/:igdbGameId',
            element: <GameDetailPage />,
            handle: { hideAuthenticatedHeader: true },
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

export const appRouter = createBrowserRouter(appRoutes)

function VideoGamesOverviewFallback() {
  return <p role="status">Cargando el resumen de videojuegos…</p>
}
