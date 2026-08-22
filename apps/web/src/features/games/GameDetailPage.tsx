import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiEditLine,
  RiShareLine,
  RiStarLine,
} from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ApiError } from '../../shared/api/client'
import { gameMonogram } from './gameMonogram'
import { playStatusLabels } from './gameLabels'
import styles from './GameDetailPage.module.css'
import { gameDetailQueryOptions } from './queries'
import type { GameDetail } from './types'

export function GameDetailPage() {
  const { igdbGameId: igdbGameIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const igdbGameId = parsePositiveInteger(igdbGameIdParam)
  const libraryGameIdParam = searchParams.get('entrada')
  const libraryGameId =
    libraryGameIdParam === null
      ? undefined
      : parsePositiveInteger(libraryGameIdParam)
  const hasInvalidParameters = igdbGameId === null || libraryGameId === null
  const detailQuery = useQuery({
    ...gameDetailQueryOptions(igdbGameId ?? 0, libraryGameId ?? undefined),
    enabled: !hasInvalidParameters,
  })
  const isNotFound =
    hasInvalidParameters ||
    (detailQuery.error instanceof ApiError && detailQuery.error.status === 404)

  function goBack() {
    if (location.key === 'default') {
      void navigate('/videojuegos', { replace: true })
      return
    }
    void navigate(-1)
  }

  return (
    <section className={styles.page} aria-label="Detalle de videojuego">
      <header className={styles.heading}>
        <button
          type="button"
          className={styles.back}
          aria-label="Volver"
          onClick={goBack}
        >
          <RiArrowLeftLine aria-hidden="true" />
        </button>
      </header>

      <div className={styles.content}>
        {isNotFound && (
          <p className={styles.status} role="alert">
            No se ha encontrado el videojuego.
          </p>
        )}

        {!isNotFound && detailQuery.isPending && (
          <p className={styles.status} role="status">
            Cargando el videojuego…
          </p>
        )}

        {!isNotFound && detailQuery.isError && (
          <div className={styles.status} role="alert">
            <p>No se ha podido cargar el videojuego.</p>
            <button type="button" onClick={() => void detailQuery.refetch()}>
              Reintentar
            </button>
          </div>
        )}

        {detailQuery.data && <GameDetailContent game={detailQuery.data} />}
      </div>
    </section>
  )
}

function GameDetailContent({ game }: { game: GameDetail }) {
  return (
    <>
      <section className={styles.summary} aria-label="Datos del videojuego">
        <div className={styles.metadata}>
          <h1 className={styles.title}>{game.title}</h1>
          {game.library_entry ? (
            <PersonalGameData game={game} />
          ) : (
            <AvailablePlatforms game={game} />
          )}
        </div>

        <div className={styles.cover}>
          {game.cover_url ? (
            <img src={game.cover_url} alt={`Portada de ${game.title}`} />
          ) : (
            <div role="img" aria-label={`Portada de ${game.title}`}>
              {gameMonogram(game.title)}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="synopsis-title">
        <h2 id="synopsis-title">Sinopsis</h2>
        <p>{game.summary ?? 'No hay una sinopsis disponible.'}</p>
      </section>

      <section className={styles.section} aria-labelledby="ratings-title">
        <h2 id="ratings-title">Ratings</h2>
        <div className={styles.rating} aria-label="Sin valoraciones disponibles">
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <RiStarLine key={index} />
            ))}
          </div>
          <strong>— / 5</strong>
        </div>
        <p>Aún no hay valoraciones disponibles.</p>
      </section>

      <section className={styles.actions} aria-labelledby="actions-title">
        <h2 id="actions-title">Acciones</h2>
        <div>
          <button type="button" disabled title="Disponible próximamente">
            <RiEditLine aria-hidden="true" />
            Editar
          </button>
          <button type="button" disabled title="Disponible próximamente">
            <RiShareLine aria-hidden="true" />
            Compartir
          </button>
          <button type="button" disabled title="Disponible próximamente">
            <RiDeleteBinLine aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </section>
    </>
  )
}

function PersonalGameData({ game }: { game: GameDetail }) {
  const entry = game.library_entry
  if (!entry) return null

  const ownership = entry.owned
    ? 'Lo tengo'
    : entry.play_status !== 'pending'
      ? 'No lo tengo'
      : null

  return (
    <>
      {ownership && <p className={styles.ownership}>{ownership}</p>}
      <dl className={styles.details}>
        <div>
          <dt>Plataforma</dt>
          <dd>{entry.platform.name}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{playStatusLabels[entry.play_status]}</dd>
        </div>
      </dl>
    </>
  )
}

function AvailablePlatforms({ game }: { game: GameDetail }) {
  return (
    <div className={styles.availablePlatforms}>
      <h2>Plataformas</h2>
      {game.platforms.length > 0 ? (
        <ul>
          {game.platforms.map((platform) => (
            <li key={platform.igdb_id}>
              {platform.abbreviation ?? platform.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sin plataformas disponibles.</p>
      )}
    </div>
  )
}

function parsePositiveInteger(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
