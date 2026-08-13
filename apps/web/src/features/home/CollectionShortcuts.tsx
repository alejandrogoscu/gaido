import { RiChat1Line, RiGamepadLine } from '@remixicon/react'

import styles from './CollectionShortcuts.module.css'

export function CollectionShortcuts() {
  return (
    <nav className={styles.shortcuts} aria-label="Tipos de colección">
      <button
        className={styles.shortcut}
        type="button"
        aria-label="Videojuegos"
        title="Disponible próximamente"
        disabled
      >
        <RiGamepadLine aria-hidden="true" />
      </button>

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