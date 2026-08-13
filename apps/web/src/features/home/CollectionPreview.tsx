import { RiArrowRightLine } from '@remixicon/react'
import type { CSSProperties } from 'react'

import styles from './CollectionPreview.module.css'
import type { CollectionPreviewData } from './previewData'

type CollectionPreviewProps = {
  collection: CollectionPreviewData
}

export function CollectionPreview({ collection }: CollectionPreviewProps) {
  return (
    <section
      className={styles.collection}
      aria-labelledby={`${collection.id}-title`}
    >
      <header className={styles.header}>
        <h2 id={`${collection.id}-title`} className={styles.title}>
          {collection.title}
        </h2>
        <button
          className={styles.viewAll}
          type="button"
          aria-label={`Ver todos: ${collection.title}`}
          title="Disponible próximamente"
          disabled
        >
          <RiArrowRightLine aria-hidden="true" />
        </button>
      </header>

      <ul className={styles.items}>
        {collection.items.map((item) => (
          <li className={styles.item} key={item.id}>
            <div
              className={styles.cover}
              style={{ '--item-accent': item.accent } as CSSProperties}
              aria-hidden="true"
            >
              <span>{item.monogram}</span>
            </div>
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.itemMeta}>{item.meta}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}