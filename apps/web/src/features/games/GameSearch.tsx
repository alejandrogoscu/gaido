import {
  RiAddLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiSearchLine,
} from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { ApiError } from '../../shared/api/client'
import { AddGameDrawer } from './AddGameDrawer'
import { searchGames } from './api'
import styles from './GameSearch.module.css'
import { PlatformLogo } from './PlatformLogo'
import { gameSearchQueryKey } from './queries'
import type { GameSearchResult } from './types'

export function GameSearch() {
  const launcherButtonRef = useRef<HTMLButtonElement>(null)
  const addButtonRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [selectedGame, setSelectedGame] = useState<GameSearchResult | null>(null)
  const searchQuery = useQuery({
    queryKey: [...gameSearchQueryKey, query],
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
    setSelectedGame(null)
    setIsOpen(false)
    setInputValue('')
    setQuery('')
    setValidationMessage('')
    window.requestAnimationFrame(() => launcherButtonRef.current?.focus())
  }

  function openGameConfiguration(
    game: GameSearchResult,
    trigger: HTMLButtonElement,
  ) {
    addButtonRef.current = trigger
    setSelectedGame(game)
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
                      <GameResult
                        game={game}
                        onAdd={openGameConfiguration}
                        key={game.igdb_id}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <AddGameDrawer
            game={selectedGame}
            isOpen={selectedGame !== null}
            onClose={() => setSelectedGame(null)}
            returnFocusRef={addButtonRef}
          />
        </section>
      )}
    </div>
  )
}

type GameResultProps = {
  game: GameSearchResult
  onAdd: (game: GameSearchResult, trigger: HTMLButtonElement) => void
}

function GameResult({ game, onAdd }: GameResultProps) {
  const hasPlatforms = game.platforms.length > 0
  const canAddPlatform = game.platforms.some((platform) => !platform.in_library)

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
        {game.in_library && (
          <p className={styles.libraryStatus}>En tu biblioteca</p>
        )}

        {hasPlatforms ? (
          <div
            className={styles.platforms}
            role="group"
            aria-label={`Disponible en: ${game.platforms
              .map((platform) => platform.name)
              .join(', ')}`}
          >
            {game.platforms.map((platform) => (
              <span
                className={`${styles.platformIcon} ${
                  platform.in_library ? styles.platformIconAdded : ''
                }`}
                role="img"
                aria-label={`${platform.name}${
                  platform.in_library ? ', en tu biblioteca' : ''
                }`}
                title={`${platform.name}${
                  platform.in_library ? ' · En tu biblioteca' : ''
                }`}
                key={platform.igdb_id}
              >
                <PlatformLogo platform={platform} />
              </span>
            ))}
          </div>
        ) : (
          <p>Sin plataformas disponibles</p>
        )}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={(event) => onAdd(game, event.currentTarget)}
        disabled={!canAddPlatform}
        aria-label={
          hasPlatforms && !canAddPlatform
            ? `${game.title} ya está en tu biblioteca`
            : `Añadir ${game.title} a la biblioteca`
        }
      >
        {hasPlatforms && !canAddPlatform ? (
          <RiCheckLine aria-hidden="true" />
        ) : (
          <RiAddLine aria-hidden="true" />
        )}
      </button>
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
