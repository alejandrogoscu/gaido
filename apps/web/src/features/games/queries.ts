import { queryOptions } from '@tanstack/react-query'

import {
  getGameDetail,
  getGameLibraryStatistics,
  getLibraryGames,
} from './api'

export const gameLibraryQueryKey = ['games', 'library'] as const
export const gameLibraryStatisticsQueryKey = [
  ...gameLibraryQueryKey,
  'statistics',
] as const
export const gameSearchQueryKey = ['games', 'search'] as const

export function gameDetailQueryKey(
  igdbGameId: number,
  libraryGameId?: number,
) {
  return ['games', 'detail', igdbGameId, libraryGameId ?? null] as const
}

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

export function gameDetailQueryOptions(
  igdbGameId: number,
  libraryGameId?: number,
) {
  return queryOptions({
    queryKey: gameDetailQueryKey(igdbGameId, libraryGameId),
    queryFn: () => getGameDetail(igdbGameId, libraryGameId),
    retry: false,
  })
}
