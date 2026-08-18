import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLibraryGames } from './api'
import { GameLibraryPage } from './GameLibraryPage'
import type { LibraryGame } from './types'

vi.mock('./api', () => ({
  getLibraryGames: vi.fn(),
}))

const mockedGetLibraryGames = vi.mocked(getLibraryGames)
const games: LibraryGame[] = [
  {
    id: 1,
    game_id: 1,
    igdb_game_id: 338106,
    title: 'Donkey Kong Bananza',
    cover_url: 'https://images.example/donkey-kong.jpg',
    platform: {
      igdb_id: 508,
      name: 'Nintendo Switch 2',
      abbreviation: 'Switch 2',
      in_library: true,
    },
    media_format: 'physical',
    owned: true,
    play_status: 'completed',
  },
  {
    id: 2,
    game_id: 2,
    igdb_game_id: 113112,
    title: 'Hades',
    cover_url: 'https://images.example/hades.jpg',
    platform: {
      igdb_id: 6,
      name: 'PC',
      abbreviation: 'PC',
      in_library: true,
    },
    media_format: 'digital',
    owned: false,
    play_status: 'playing',
  },
  {
    id: 3,
    game_id: 3,
    igdb_game_id: 17000,
    title: 'Celeste',
    cover_url: null,
    platform: {
      igdb_id: 130,
      name: 'Nintendo Switch',
      abbreviation: 'Switch',
      in_library: true,
    },
    media_format: 'digital',
    owned: true,
    play_status: 'played',
  },
]

describe('listado de biblioteca de videojuegos', () => {
  beforeEach(() => {
    mockedGetLibraryGames.mockReset()
    mockedGetLibraryGames.mockResolvedValue(games)
  })

  it('muestra el buscador, los filtros y la cuadrícula de videojuegos', async () => {
    renderLibrary()

    expect(
      await screen.findByRole('heading', { name: 'Mis videojuegos' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('searchbox', { name: 'Buscar en mis videojuegos' }),
    ).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Filtros' })).toBeTruthy()
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por plataforma' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por estado' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('combobox', { name: 'Filtrar por propiedad' }),
    ).toBeTruthy()

    const library = await screen.findByRole('list', {
      name: 'Videojuegos de mi biblioteca',
    })
    expect(within(library).getAllByRole('listitem')).toHaveLength(3)
    expect(
      within(library).getByLabelText('Plataforma: Nintendo Switch 2'),
    ).toBeTruthy()
    expect(within(library).getByRole('img', { name: 'Celeste' })).toBeTruthy()
  })

  it('combina la búsqueda con los filtros de plataforma, estado y propiedad', async () => {
    const user = userEvent.setup()
    renderLibrary()
    await screen.findByRole('img', { name: 'Hades' })

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por plataforma' }),
      '6',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por estado' }),
      'playing',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por propiedad' }),
      'not-owned',
    )

    expect(screen.getByRole('article', { name: 'Hades' })).toBeTruthy()
    expect(
      screen.queryByRole('article', { name: 'Donkey Kong Bananza' }),
    ).toBeNull()

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar en mis videojuegos' }),
      'Donkey',
    )

    expect(
      screen.getByText('No hay videojuegos que coincidan con los filtros.'),
    ).toBeTruthy()
  })

  it('muestra el estado vacío de la biblioteca', async () => {
    mockedGetLibraryGames.mockResolvedValue([])

    renderLibrary()

    expect(
      await screen.findByText('Aún no has añadido ningún videojuego.'),
    ).toBeTruthy()
  })

  it('permite reintentar cuando falla la carga', async () => {
    mockedGetLibraryGames
      .mockRejectedValueOnce(new Error('Error de red'))
      .mockResolvedValueOnce(games)
    const user = userEvent.setup()
    renderLibrary()

    expect(
      await screen.findByText('No se ha podido cargar tu biblioteca.'),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('img', { name: 'Hades' })).toBeTruthy()
  })
})

function renderLibrary() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={['/biblioteca/videojuegos']}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return render(<GameLibraryPage />, { wrapper: Wrapper })
}