import { RiArrowRightLine } from '@remixicon/react'
import { Link } from 'react-router-dom'

import { gameDetailPath } from './gameDetailPath'
import { gameMonogram } from './gameMonogram'
import styles from './GameLibraryAccess.module.css'
import type { LibraryGame } from './types'

const previewLimit = 5

export function GameLibraryAccess({ games }: { games: LibraryGame[] }) {
  const previewGames = games.slice(0, previewLimit)

  return (
    <section className={styles.card} aria-labelledby="game-library-access-title">
      <Link
        className={styles.header}
        to="/biblioteca/videojuegos"
        aria-label="Abrir mis videojuegos"
      >
        <h2 id="game-library-access-title">Mis videojuegos</h2>
        <RiArrowRightLine aria-hidden="true" />
      </Link>

      {previewGames.length === 0 ? (
        <p className={styles.empty}>Aún no has añadido ningún videojuego.</p>
      ) : (
        <ul className={styles.covers} aria-label="Últimos videojuegos añadidos">
          {previewGames.map((game) => (
            <li key={game.id}>
              <Link
                className={styles.coverLink}
                to={gameDetailPath(game.igdb_game_id, game.id)}
                aria-label={`Ver detalle de ${game.title}`}
              >
                {game.cover_url ? (
                  <img src={game.cover_url} alt="" />
                ) : (
                  <div className={styles.coverFallback} aria-hidden="true">
                    {gameMonogram(game.title)}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
