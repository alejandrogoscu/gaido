import { queryOptions } from '@tanstack/react-query'

import { getLibraryGames } from './api'

export const gameLibraryQueryKey = ['games', 'library'] as const
export const gameSearchQueryKey = ['games', 'search'] as const

export const gameLibraryQueryOptions = queryOptions({
  queryKey: gameLibraryQueryKey,
  queryFn: getLibraryGames,
  retry: false,
})
