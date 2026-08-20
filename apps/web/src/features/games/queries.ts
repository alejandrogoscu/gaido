import { queryOptions } from '@tanstack/react-query'

import { getGameLibraryStatistics, getLibraryGames } from './api'

export const gameLibraryQueryKey = ['games', 'library'] as const
export const gameLibraryStatisticsQueryKey = [
  ...gameLibraryQueryKey,
  'statistics',
] as const
export const gameSearchQueryKey = ['games', 'search'] as const

export const gameLibraryQueryOptions = queryOptions({
  queryKey: gameLibraryQueryKey,
  queryFn: getLibraryGames,
  retry: false,
})

export const gameLibraryStatisticsQueryOptions = queryOptions({
  queryKey: gameLibraryStatisticsQueryKey,
  queryFn: getGameLibraryStatistics,
  retry: false,
})
