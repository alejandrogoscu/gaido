import { queryOptions } from '@tanstack/react-query'

import { getCurrentUser } from './api'

export const currentUserQueryKey = ['auth', 'current-user'] as const

export const currentUserQueryOptions = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: getCurrentUser,
  retry: false,
  staleTime: 5 * 60 * 1000,
})
