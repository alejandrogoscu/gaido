export type CollectionPreviewItem = {
  id: string
  title: string
  meta: string
  monogram: string
  accent: string
  coverUrl?: string
  detailPath?: string
}

export type CollectionPreviewData = {
  id: string
  title: string
  items: CollectionPreviewItem[]
}

export const comicsPreview: CollectionPreviewData = {
  id: 'comics',
  title: 'Cómics',
  items: [
    {
      id: 'saga',
      title: 'Saga',
      meta: 'Brian K. Vaughan · Fiona Staples',
      monogram: 'SA',
      accent: '#a7d8cb',
    },
    {
      id: 'watchmen',
      title: 'Watchmen',
      meta: 'Alan Moore · Dave Gibbons',
      monogram: 'WA',
      accent: '#e8d34f',
    },
    {
      id: 'paper-girls',
      title: 'Paper Girls',
      meta: 'Brian K. Vaughan · Cliff Chiang',
      monogram: 'PG',
      accent: '#d995c5',
    },
  ],
}
