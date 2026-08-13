export type CollectionPreviewItem = {
  id: string
  title: string
  meta: string
  monogram: string
  accent: string
}

export type CollectionPreviewData = {
  id: string
  title: string
  items: CollectionPreviewItem[]
}

export const collectionPreviews: CollectionPreviewData[] = [
  {
    id: 'video-games',
    title: 'Videojuegos',
    items: [
      {
        id: 'hollow-knight',
        title: 'Hollow Knight',
        meta: 'Nintendo Switch',
        monogram: 'HK',
        accent: '#b9d7e8',
      },
      {
        id: 'celeste',
        title: 'Celeste',
        meta: 'PC',
        monogram: 'CE',
        accent: '#ef7f78',
      },
      {
        id: 'hades',
        title: 'Hades',
        meta: 'PlayStation 5',
        monogram: 'HA',
        accent: '#f0b84b',
      },
    ],
  },
  {
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
  },
]