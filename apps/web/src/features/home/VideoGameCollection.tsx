import { useQuery } from '@tanstack/react-query'

import { gameMonogram } from '../games/gameMonogram'
import { gameLibraryQueryOptions } from '../games/queries'
import { CollectionPreview } from './CollectionPreview'
import type { CollectionPreviewData } from './previewData'

const fallbackAccents = ['#b9d7e8', '#ef7f78', '#f0b84b']

export function VideoGameCollection() {
  const libraryQuery = useQuery(gameLibraryQueryOptions)
  const collection: CollectionPreviewData = {
    id: 'video-games',
    title: 'Videojuegos',
    items: (libraryQuery.data ?? []).slice(0, 3).map((game, index) => ({
      id: game.id.toString(),
      title: game.title,
      meta: game.platform.abbreviation ?? game.platform.name,
      monogram: gameMonogram(game.title),
      accent: fallbackAccents[index % fallbackAccents.length] ?? '#b9d7e8',
      ...(game.cover_url ? { coverUrl: game.cover_url } : {}),
    })),
  }

  if (libraryQuery.isPending) {
    return (
      <CollectionPreview
        collection={collection}
        statusMessage="Cargando tu biblioteca…"
      />
    )
  }

  if (libraryQuery.isError) {
    return (
      <CollectionPreview
        collection={collection}
        statusMessage="No se ha podido cargar tu biblioteca."
        onRetry={() => void libraryQuery.refetch()}
      />
    )
  }

  if (collection.items.length === 0) {
    return (
      <CollectionPreview
        collection={collection}
        statusMessage="Aún no has añadido ningún videojuego."
      />
    )
  }

  return <CollectionPreview collection={collection} coverOnly />
}
