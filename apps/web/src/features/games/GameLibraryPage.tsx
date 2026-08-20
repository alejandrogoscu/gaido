import { RiArrowLeftLine, RiSearchLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { gameLibraryQueryOptions } from './queries'
import { gameMonogram } from './gameMonogram'
import {
  emptyGameLibraryFilters,
  GameLibraryFilters,
  type GameLibraryFilterValues,
  type GameLibraryPlatformOption,
} from './GameLibraryFilters'
import styles from './GameLibraryPage.module.css'
import type { LibraryGame } from './types'

export function GameLibraryPage() {
  const libraryQuery = useQuery(gameLibraryQueryOptions)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<GameLibraryFilterValues>(() => ({
    ...emptyGameLibraryFilters,
  }))
  const games = libraryQuery.data ?? []
  const platforms = useMemo(() => uniquePlatforms(games), [games])
  const filteredGames = useMemo(
    () => filterGames(games, search, filters),
    [filters, games, search],
  )

  return (
    <section className={styles.page} aria-labelledby="game-library-title">
      <header className={styles.heading}>
        <Link className={styles.back} to="/" aria-label="Volver al inicio">
          <RiArrowLeftLine aria-hidden="true" />
        </Link>
        <h1 id="game-library-title">Mis videojuegos</h1>
      </header>

      <div className={styles.content}>
        <label className={styles.search}>
          <RiSearchLine aria-hidden="true" />
          <span className={styles.visuallyHidden}>
            Buscar en mis videojuegos
          </span>
          <input
            type="search"
            value={search}
            placeholder="Busca en tus videojuegos…"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <GameLibraryFilters
          values={filters}
          platforms={platforms}
          onChange={setFilters}
        />

        <LibraryContent
          games={filteredGames}
          hasFilters={
            search.trim() !== '' ||
            filters.platformId !== 'all' ||
            filters.playStatus !== 'all' ||
            filters.owned !== 'all'
          }
          isPending={libraryQuery.isPending}
          isError={libraryQuery.isError}
          onRetry={() => void libraryQuery.refetch()}
        />
      </div>
    </section>
  )
}

type LibraryContentProps = {
  games: LibraryGame[]
  hasFilters: boolean
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

function LibraryContent({
  games,
  hasFilters,
  isPending,
  isError,
  onRetry,
}: LibraryContentProps) {
  if (isPending) {
    return (
      <p className={styles.status} role="status">
        Cargando tu biblioteca…
      </p>
    )
  }

  if (isError) {
    return (
      <div className={styles.status} role="alert">
        <p>No se ha podido cargar tu biblioteca.</p>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <p className={styles.status} role="status">
        {hasFilters
          ? 'No hay videojuegos que coincidan con los filtros.'
          : 'Aún no has añadido ningún videojuego.'}
      </p>
    )
  }

  return (
    <ul className={styles.grid} aria-label="Videojuegos de mi biblioteca">
      {games.map((game) => (
        <li key={game.id}>
          <article className={styles.game} aria-label={game.title}>
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} />
            ) : (
              <div
                className={styles.coverFallback}
                role="img"
                aria-label={game.title}
              >
                {gameMonogram(game.title)}
              </div>
            )}
            <span
              className={styles.platform}
              aria-label={`Plataforma: ${game.platform.name}`}
              title={game.platform.name}
            >
              {game.platform.abbreviation ?? game.platform.name}
            </span>
          </article>
        </li>
      ))}
    </ul>
  )
}

function uniquePlatforms(games: LibraryGame[]): GameLibraryPlatformOption[] {
  const platforms = new Map<number, GameLibraryPlatformOption>()

  for (const game of games) {
    platforms.set(game.platform.igdb_id, {
      igdbId: game.platform.igdb_id,
      name: game.platform.name,
    })
  }

  return [...platforms.values()].sort((first, second) =>
    first.name.localeCompare(second.name, 'es'),
  )
}

function filterGames(
  games: LibraryGame[],
  search: string,
  filters: GameLibraryFilterValues,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase('es')

  return games.filter((game) => {
    const matchesSearch = game.title
      .toLocaleLowerCase('es')
      .includes(normalizedSearch)
    const matchesPlatform =
      filters.platformId === 'all' ||
      game.platform.igdb_id.toString() === filters.platformId
    const matchesStatus =
      filters.playStatus === 'all' || game.play_status === filters.playStatus
    const matchesOwnership =
      filters.owned === 'all' ||
      (filters.owned === 'owned' ? game.owned : !game.owned)

    return (
      matchesSearch && matchesPlatform && matchesStatus && matchesOwnership
    )
  })
}
