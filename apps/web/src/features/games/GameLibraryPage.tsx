import { RiArrowLeftLine, RiFilter3Line, RiSearchLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { gameLibraryQueryOptions } from './queries'
import { gameMonogram } from './gameMonogram'
import styles from './GameLibraryPage.module.css'
import type { LibraryGame, PlayStatus } from './types'

const playStatusLabels: Record<PlayStatus, string> = {
  pending: 'Pendiente',
  playing: 'Jugando',
  played: 'Jugado',
  completed: 'Completado',
}

type OwnedFilter = 'all' | 'owned' | 'not-owned'

export function GameLibraryPage() {
  const libraryQuery = useQuery(gameLibraryQueryOptions)
  const [search, setSearch] = useState('')
  const [platformId, setPlatformId] = useState('all')
  const [playStatus, setPlayStatus] = useState<'all' | PlayStatus>('all')
  const [owned, setOwned] = useState<OwnedFilter>('all')
  const games = libraryQuery.data ?? []
  const platforms = useMemo(() => uniquePlatforms(games), [games])
  const filteredGames = useMemo(
    () => filterGames(games, search, platformId, playStatus, owned),
    [games, owned, platformId, playStatus, search],
  )

  return (
    <section className={styles.page} aria-labelledby="game-library-title">
      <header className={styles.heading}>
        <Link className={styles.back} to="/" aria-label="Volver al inicio">
          <RiArrowLeftLine aria-hidden="true" />
        </Link>
        <h1 id="game-library-title">Mis videojuegos</h1>
      </header>

      <label className={styles.search}>
        <RiSearchLine aria-hidden="true" />
        <span className={styles.visuallyHidden}>Buscar en mis videojuegos</span>
        <input
          type="search"
          value={search}
          placeholder="Busca en tus videojuegos…"
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <div className={styles.filters} role="group" aria-label="Filtros">
        <div className={styles.filterHeading}>
          <RiFilter3Line aria-hidden="true" />
          Filtros
        </div>

        <label className={styles.filter}>
          <span className={styles.visuallyHidden}>Filtrar por plataforma</span>
          <select
            value={platformId}
            aria-label="Filtrar por plataforma"
            onChange={(event) => setPlatformId(event.target.value)}
          >
            <option value="all">Plataforma</option>
            {platforms.map((platform) => (
              <option value={platform.igdbId.toString()} key={platform.igdbId}>
                {platform.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span className={styles.visuallyHidden}>Filtrar por estado</span>
          <select
            value={playStatus}
            aria-label="Filtrar por estado"
            onChange={(event) =>
              setPlayStatus(event.target.value as 'all' | PlayStatus)
            }
          >
            <option value="all">Estado</option>
            {Object.entries(playStatusLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span className={styles.visuallyHidden}>Filtrar por propiedad</span>
          <select
            value={owned}
            aria-label="Filtrar por propiedad"
            onChange={(event) => setOwned(event.target.value as OwnedFilter)}
          >
            <option value="all">Propiedad</option>
            <option value="owned">Lo poseo</option>
            <option value="not-owned">No lo poseo</option>
          </select>
        </label>
      </div>

      <LibraryContent
        games={filteredGames}
        hasFilters={
          search.trim() !== '' ||
          platformId !== 'all' ||
          playStatus !== 'all' ||
          owned !== 'all'
        }
        isPending={libraryQuery.isPending}
        isError={libraryQuery.isError}
        onRetry={() => void libraryQuery.refetch()}
      />
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

function uniquePlatforms(games: LibraryGame[]) {
  const platforms = new Map<
    number,
    { igdbId: number; name: string }
  >()

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
  platformId: string,
  playStatus: 'all' | PlayStatus,
  owned: OwnedFilter,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase('es')

  return games.filter((game) => {
    const matchesSearch = game.title
      .toLocaleLowerCase('es')
      .includes(normalizedSearch)
    const matchesPlatform =
      platformId === 'all' || game.platform.igdb_id.toString() === platformId
    const matchesStatus =
      playStatus === 'all' || game.play_status === playStatus
    const matchesOwnership =
      owned === 'all' || (owned === 'owned' ? game.owned : !game.owned)

    return (
      matchesSearch && matchesPlatform && matchesStatus && matchesOwnership
    )
  })
}