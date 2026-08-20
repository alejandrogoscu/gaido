import { apiRequest } from '../../shared/api/client'
import type {
  AddLibraryGameData,
  GameLibraryStatistics,
  GameSearchResult,
  LibraryGame,
} from './types'

const GAME_SEARCH_PATH = '/api/v1/games/search'
const GAME_LIBRARY_PATH = '/api/v1/library/games'
const GAME_LIBRARY_STATISTICS_PATH = `${GAME_LIBRARY_PATH}/statistics`

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const parameters = new URLSearchParams({ q: query })
  const response = await apiRequest(`${GAME_SEARCH_PATH}?${parameters.toString()}`)
  return (await response.json()) as GameSearchResult[]
}

export async function getLibraryGames(): Promise<LibraryGame[]> {
  const response = await apiRequest(GAME_LIBRARY_PATH)
  return (await response.json()) as LibraryGame[]
}

export async function getGameLibraryStatistics(): Promise<GameLibraryStatistics> {
  const response = await apiRequest(GAME_LIBRARY_STATISTICS_PATH)
  return (await response.json()) as GameLibraryStatistics
}

export async function addLibraryGame(
  data: AddLibraryGameData,
): Promise<LibraryGame> {
  const response = await apiRequest(GAME_LIBRARY_PATH, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  return (await response.json()) as LibraryGame
}
