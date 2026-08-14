import { RiArrowRightLine } from '@remixicon/react'
import type { CSSProperties } from 'react'

import styles from './CollectionPreview.module.css'
import type { CollectionPreviewData } from './previewData'

type CollectionPreviewProps = {
  collection: CollectionPreviewData
  statusMessage?: string
  onRetry?: () => void
}

export function CollectionPreview({
  collection,
  statusMessage,
  onRetry,
}: CollectionPreviewProps) {
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

      {statusMessage ? (
        <div className={styles.status} role={onRetry ? 'alert' : 'status'}>
          <p>{statusMessage}</p>
          {onRetry && (
            <button type="button" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.items}>
          {collection.items.map((item) => (
            <li className={styles.item} key={item.id}>
              {item.coverUrl ? (
                <img className={styles.coverImage} src={item.coverUrl} alt="" />
              ) : (
                <div
                  className={styles.cover}
                  style={{ '--item-accent': item.accent } as CSSProperties}
                  aria-hidden="true"
                >
                  <span>{item.monogram}</span>
                </div>
              )}
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemMeta}>{item.meta}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}