import {
  RiAddLine,
  RiArrowLeftLine,
  RiSearchLine,
} from '@remixicon/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { ApiError } from '../../shared/api/client'
import { addLibraryGame, searchGames } from './api'
import styles from './GameSearch.module.css'
import { gameLibraryQueryKey } from './queries'
import type { GameSearchResult } from './types'

export function GameSearch() {
  const launcherButtonRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const searchQuery = useQuery({
    queryKey: ['games', 'search', query],
    queryFn: () => searchGames(query),
    enabled: query.length >= 2,
    retry: false,
  })

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSearch()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isOpen])

  function openSearch() {
    setIsEditing(true)
    setIsOpen(true)
  }

  function closeSearch() {
    setIsOpen(false)
    setInputValue('')
    setQuery('')
    setValidationMessage('')
    window.requestAnimationFrame(() => launcherButtonRef.current?.focus())
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedQuery = inputValue.trim()

    if (normalizedQuery.length < 2) {
      setValidationMessage('Escribe al menos dos caracteres')
      setQuery('')
      return
    }

    setValidationMessage('')
    setQuery(normalizedQuery)
    setIsEditing(false)
  }

  return (
    <div className={styles.searchArea}>
      <div
        className={styles.launcher}
        role="search"
        aria-hidden={isOpen ? 'true' : undefined}
      >
        <input
          type="search"
          value={inputValue}
          placeholder="Buscar videojuegos"
          aria-label="Buscar videojuegos"
          readOnly
          tabIndex={isOpen ? -1 : 0}
          onFocus={openSearch}
        />
        <button
          ref={launcherButtonRef}
          type="button"
          aria-label="Abrir búsqueda"
          tabIndex={isOpen ? -1 : 0}
          onClick={openSearch}
        >
          <RiSearchLine aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <section
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar videojuegos"
        >
          <header className={styles.overlayHeader}>
            <button
              type="button"
              className={styles.navigationButton}
              aria-label="Cerrar búsqueda"
              onClick={closeSearch}
            >
              <RiArrowLeftLine aria-hidden="true" />
            </button>

            {isEditing ? (
              <form className={styles.overlayForm} onSubmit={handleSubmit}>
                <input
                  type="search"
                  value={inputValue}
                  onChange={(event) => {
                    setInputValue(event.target.value)
                    setValidationMessage('')
                  }}
                  placeholder="Buscar…"
                  aria-label="Buscar videojuegos"
                  aria-describedby="game-search-feedback"
                  autoFocus
                />
              </form>
            ) : (
              <>
                <h2 className={styles.queryTitle}>{query}</h2>
                <button
                  type="button"
                  className={styles.navigationButton}
                  aria-label="Editar búsqueda"
                  onClick={() => setIsEditing(true)}
                >
                  <RiSearchLine aria-hidden="true" />
                </button>
              </>
            )}
          </header>

          <div className={styles.overlayContent}>
            <div
              id="game-search-feedback"
              className={styles.feedback}
              aria-live="polite"
            >
              {validationMessage}
              {searchQuery.isFetching && 'Buscando videojuegos…'}
              {searchQuery.isError && errorMessage(searchQuery.error)}
            </div>

            {isEditing && !validationMessage && (
              <p className={styles.guidance}>
                Busca un videojuego para añadirlo a tu biblioteca.
              </p>
            )}

            {!isEditing && searchQuery.isSuccess && query && (
              <div className={styles.results} aria-label="Resultados de búsqueda">
                {searchQuery.data.length === 0 ? (
                  <p className={styles.empty}>No se han encontrado videojuegos.</p>
                ) : (
                  <ul>
                    {searchQuery.data.map((game) => (
                      <GameResult game={game} key={game.igdb_id} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

type GameResultProps = {
  game: GameSearchResult
}

function GameResult({ game }: GameResultProps) {
  const queryClient = useQueryClient()
  const [platformId, setPlatformId] = useState(
    game.platforms[0]?.igdb_id.toString() ?? '',
  )
  const addMutation = useMutation({
    mutationFn: addLibraryGame,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: gameLibraryQueryKey })
    },
  })
  const hasPlatforms = game.platforms.length > 0

  function handleAdd() {
    if (!platformId) return
    addMutation.mutate({
      igdb_game_id: game.igdb_id,
      igdb_platform_id: Number(platformId),
    })
  }

  return (
    <li className={styles.result}>
      {game.cover_url ? (
        <img src={game.cover_url} alt="" className={styles.cover} />
      ) : (
        <div className={styles.coverFallback} aria-hidden="true">
          {monogram(game.title)}
        </div>
      )}

      <div className={styles.resultContent}>
        <h2>{game.title}</h2>
        {game.first_release_date && <p>{game.first_release_date.slice(0, 4)}</p>}

        {hasPlatforms ? (
          <select
            value={platformId}
            onChange={(event) => setPlatformId(event.target.value)}
            aria-label={`Plataforma de ${game.title}`}
          >
            {game.platforms.map((platform) => (
              <option value={platform.igdb_id} key={platform.igdb_id}>
                {platform.abbreviation ?? platform.name}
              </option>
            ))}
          </select>
        ) : (
          <p>Sin plataformas disponibles</p>
        )}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={handleAdd}
        disabled={!hasPlatforms || addMutation.isPending || addMutation.isSuccess}
        aria-label={`Añadir ${game.title} a la biblioteca`}
      >
        <RiAddLine aria-hidden="true" />
      </button>

      <div className={styles.resultFeedback} aria-live="polite">
        {addMutation.isPending && 'Añadiendo…'}
        {addMutation.isSuccess && 'Añadido a tu biblioteca'}
        {addMutation.isError && errorMessage(addMutation.error)}
      </div>
    </li>
  )
}

function errorMessage(error: Error): string {
  return error instanceof ApiError
    ? error.message
    : 'No se ha podido completar la solicitud'
}

function monogram(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}