import { RiChat1Line, RiGamepadLine } from '@remixicon/react'
import { Link } from 'react-router-dom'

import styles from './CollectionShortcuts.module.css'

export function CollectionShortcuts() {
  return (
    <nav className={styles.shortcuts} aria-label="Tipos de colección">
      <Link
        className={styles.shortcut}
        to="/videojuegos"
        aria-label="Videojuegos"
      >
        <RiGamepadLine aria-hidden="true" />
      </Link>

      <button
        className={styles.shortcut}
        type="button"
        aria-label="Cómics"
        title="Disponible próximamente"
        disabled
      >
        <RiChat1Line aria-hidden="true" />
      </button>
    </nav>
  )
}
