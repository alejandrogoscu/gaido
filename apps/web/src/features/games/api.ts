import { apiRequest } from '../../shared/api/client'
import type {
  AddLibraryGameData,
  GameSearchResult,
  LibraryGame,
} from './types'

const GAME_SEARCH_PATH = '/api/v1/games/search'
const GAME_LIBRARY_PATH = '/api/v1/library/games'

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const parameters = new URLSearchParams({ q: query })
  const response = await apiRequest(`${GAME_SEARCH_PATH}?${parameters.toString()}`)
  return (await response.json()) as GameSearchResult[]
}

export async function getLibraryGames(): Promise<LibraryGame[]> {
  const response = await apiRequest(GAME_LIBRARY_PATH)
  return (await response.json()) as LibraryGame[]
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