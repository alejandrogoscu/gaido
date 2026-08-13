import { RiSearchLine } from '@remixicon/react'

import { CollectionPreview } from './CollectionPreview'
import { CollectionShortcuts } from './CollectionShortcuts'
import styles from './HomePage.module.css'
import { collectionPreviews } from './previewData'

export function HomePage() {
  return (
    <section className={styles.page} aria-labelledby="home-title">
      <h1 id="home-title" className={styles.visuallyHidden}>
        Inicio
      </h1>

      <div className={styles.search} role="search">
        <RiSearchLine className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar en tu colección"
          aria-label="Buscar en tu colección"
          aria-describedby="search-availability"
          disabled
        />
        <span id="search-availability" className={styles.visuallyHidden}>
          La búsqueda estará disponible próximamente
        </span>
      </div>

      <CollectionShortcuts />

      <div className={styles.collections}>
        {collectionPreviews.map((collection) => (
          <CollectionPreview collection={collection} key={collection.id} />
        ))}
      </div>
    </section>
  )
}