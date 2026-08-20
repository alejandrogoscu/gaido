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
      screen.getByRole('button', {
        name: 'Filtrar por plataforma: Plataforma',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Filtrar por estado: Estado' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', {
        name: 'Filtrar por propiedad: Propiedad',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Abrir todos los filtros' }),
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

    await chooseDirectFilter(
      user,
      'Filtrar por plataforma: Plataforma',
      'Filtrar por plataforma',
      'PC',
    )
    await chooseDirectFilter(
      user,
      'Filtrar por estado: Estado',
      'Filtrar por estado',
      'Jugando',
    )
    await chooseDirectFilter(
      user,
      'Filtrar por propiedad: Propiedad',
      'Filtrar por propiedad',
      'No lo tengo',
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

  it('permite configurar y borrar los filtros desde el panel global', async () => {
    const user = userEvent.setup()
    renderLibrary()
    await screen.findByRole('img', { name: 'Hades' })

    await user.click(
      screen.getByRole('button', { name: 'Abrir todos los filtros' }),
    )
    let globalPanel = screen.getByRole('dialog', {
      name: 'Filtros de videojuegos',
    })
    expect(
      within(globalPanel)
        .getByRole('button', { name: 'Borrar' })
        .hasAttribute('disabled'),
    ).toBe(true)

    await user.click(
      within(globalPanel).getByRole('button', { name: 'Estado: Todos' }),
    )
    const statusPanel = screen.getByRole('dialog', {
      name: 'Filtrar por estado',
    })
    await user.click(
      within(statusPanel).getByRole('radio', { name: 'Completado' }),
    )
    await user.click(
      within(statusPanel).getByRole('button', {
        name: 'Cerrar filtro de estado',
      }),
    )

    globalPanel = screen.getByRole('dialog', {
      name: 'Filtros de videojuegos',
    })
    expect(
      within(globalPanel).getByRole('button', { name: 'Estado: Completado' }),
    ).toBeTruthy()
    await user.click(
      within(globalPanel).getByRole('button', { name: 'Ver resultados' }),
    )

    expect(
      screen.getByRole('article', { name: 'Donkey Kong Bananza' }),
    ).toBeTruthy()
    expect(screen.queryByRole('article', { name: 'Hades' })).toBeNull()

    await user.click(
      screen.getByRole('button', { name: 'Abrir todos los filtros' }),
    )
    globalPanel = screen.getByRole('dialog', {
      name: 'Filtros de videojuegos',
    })
    await user.click(
      within(globalPanel).getByRole('button', { name: 'Borrar' }),
    )
    await user.click(
      within(globalPanel).getByRole('button', { name: 'Ver resultados' }),
    )

    expect(
      within(
        screen.getByRole('list', {
          name: 'Videojuegos de mi biblioteca',
        }),
      ).getAllByRole('listitem'),
    ).toHaveLength(3)
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

async function chooseDirectFilter(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: string,
  dialogName: string,
  optionName: string,
) {
  await user.click(screen.getByRole('button', { name: triggerName }))
  const panel = screen.getByRole('dialog', { name: dialogName })
  await user.click(within(panel).getByRole('radio', { name: optionName }))
  await user.click(
    within(panel).getByRole('button', { name: 'Ver resultados' }),
  )
}
