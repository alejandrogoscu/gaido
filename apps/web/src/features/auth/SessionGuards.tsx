import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { SessionError, SessionLoading } from './SessionFeedback'
import { currentUserQueryOptions } from './session'
import type { AuthUser } from './types'

export type AuthenticatedRouteContext = {
  user: AuthUser
}

export function RequireAuthenticated() {
  const currentUserQuery = useQuery(currentUserQueryOptions)

  if (currentUserQuery.isPending) {
    return <SessionLoading />
  }

  if (currentUserQuery.isError) {
    return <SessionError onRetry={() => void currentUserQuery.refetch()} />
  }

  if (!currentUserQuery.data) {
    return <Navigate to="/login" replace />
  }

  return <Outlet context={{ user: currentUserQuery.data }} />
}

export function RequireGuest() {
  const currentUserQuery = useQuery(currentUserQueryOptions)

  if (currentUserQuery.isPending) {
    return <SessionLoading />
  }

  if (currentUserQuery.isError) {
    return <SessionError onRetry={() => void currentUserQuery.refetch()} />
  }

  if (currentUserQuery.data) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
