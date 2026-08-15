export type GamePlatform = {
  igdb_id: number
  name: string
  abbreviation: string | null
}

export type MediaFormat = 'unknown' | 'physical' | 'digital'
export type PlayStatus = 'pending' | 'playing' | 'played' | 'completed'

export type GameSearchResult = {
  igdb_id: number
  title: string
  summary: string | null
  first_release_date: string | null
  cover_url: string | null
  platforms: GamePlatform[]
}

export type LibraryGame = {
  id: number
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
  media_format: Exclude<MediaFormat, 'unknown'>
  owned: boolean
  play_status: PlayStatus
}