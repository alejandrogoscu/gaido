import { GameSearch } from '../games/GameSearch'
import { CollectionPreview } from './CollectionPreview'
import { CollectionShortcuts } from './CollectionShortcuts'
import styles from './HomePage.module.css'
import { comicsPreview } from './previewData'
import { VideoGameCollection } from './VideoGameCollection'

export function HomePage() {
  return (
    <section className={styles.page} aria-labelledby="home-title">
      <h1 id="home-title" className={styles.visuallyHidden}>
        Inicio
      </h1>

      <GameSearch />

      <CollectionShortcuts />

      <div className={styles.collections}>
        <VideoGameCollection />
        <CollectionPreview collection={comicsPreview} />
      </div>
    </section>
  )
}