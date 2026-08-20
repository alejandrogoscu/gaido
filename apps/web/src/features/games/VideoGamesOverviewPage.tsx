import { RiArrowLeftLine } from '@remixicon/react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { GameDistributionCard } from './GameDistributionCard'
import { GameLibraryAccess } from './GameLibraryAccess'
import styles from './VideoGamesOverviewPage.module.css'
import {
  gameLibraryQueryOptions,
  gameLibraryStatisticsQueryOptions,
} from './queries'

export function VideoGamesOverviewPage() {
  const statisticsQuery = useQuery(gameLibraryStatisticsQueryOptions)
  const libraryQuery = useQuery(gameLibraryQueryOptions)
  const isPending = statisticsQuery.isPending || libraryQuery.isPending
  const isError = statisticsQuery.isError || libraryQuery.isError

  function retry() {
    void statisticsQuery.refetch()
    void libraryQuery.refetch()
  }

  return (
    <section className={styles.page} aria-labelledby="video-games-title">
      <header className={styles.heading}>
        <Link className={styles.back} to="/" aria-label="Volver al inicio">
          <RiArrowLeftLine aria-hidden="true" />
        </Link>
        <h1 id="video-games-title">Videojuegos</h1>
      </header>

      <div className={styles.content}>
        {isPending && (
          <p className={styles.status} role="status">
            Cargando el resumen de videojuegos…
          </p>
        )}

        {isError && (
          <div className={styles.status} role="alert">
            <p>No se ha podido cargar el resumen de videojuegos.</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}

        {!isPending && !isError && statisticsQuery.data && libraryQuery.data && (
          <>
            <dl
              className={styles.totals}
              role="group"
              aria-label="Totales de videojuegos"
            >
              <div>
                <dt>Videojuegos</dt>
                <dd>{statisticsQuery.data.total_games}</dd>
              </div>
              <div>
                <dt>Plataformas</dt>
                <dd>{statisticsQuery.data.total_platforms}</dd>
              </div>
            </dl>

            <GameLibraryAccess games={libraryQuery.data} />

            <div className={styles.distributions}>
              <GameDistributionCard
                title="Progreso"
                segments={[
                  {
                    label: 'Jugados',
                    value: statisticsQuery.data.progress.played,
                    color: 'var(--color-accent-strong)',
                  },
                  {
                    label: 'Por jugar',
                    value: statisticsQuery.data.progress.to_play,
                    color: 'var(--color-line-strong)',
                  },
                ]}
                emptyMessage="Aún no hay videojuegos en tu biblioteca."
              />

              <GameDistributionCard
                title="Formato"
                segments={[
                  {
                    label: 'Físicos',
                    value: statisticsQuery.data.formats.physical,
                    color: 'var(--color-accent-strong)',
                  },
                  {
                    label: 'Digitales',
                    value: statisticsQuery.data.formats.digital,
                    color: 'var(--color-line-strong)',
                  },
                ]}
                emptyMessage="Aún no tienes videojuegos en propiedad."
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
