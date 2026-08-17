export type GamePlatform = {
  igdb_id: number
  name: string
  abbreviation: string | null
  in_library: boolean
}

export type MediaFormat = 'physical' | 'digital'
export type PlayStatus = 'pending' | 'playing' | 'played' | 'completed'

export type GameSearchResult = {
  game_id: number | null
  igdb_id: number
  title: string
  summary: string | null
  category: string | null
  first_release_date: string | null
  cover_url: string | null
  platforms: GamePlatform[]
  in_library: boolean
}

export type LibraryGame = {
  id: number
  game_id: number
  igdb_game_id: number
  title: string
  cover_url: string | null
  platform: GamePlatform
  media_format: MediaFormat
  owned: boolean
  play_status: PlayStatus
}

export type AddLibraryGameData = {
  igdb_game_id: number
  igdb_platform_id: number
  media_format: MediaFormat
  owned: boolean
  play_status: PlayStatus
}
