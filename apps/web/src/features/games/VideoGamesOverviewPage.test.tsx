import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getGameLibraryStatistics, getLibraryGames } from './api'
import type { GameLibraryStatistics, LibraryGame } from './types'
import { VideoGamesOverviewPage } from './VideoGamesOverviewPage'

vi.mock('./api', () => ({
  getGameLibraryStatistics: vi.fn(),
  getLibraryGames: vi.fn(),
}))

vi.mock('recharts', () => ({
  Cell: () => null,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

const mockedGetStatistics = vi.mocked(getGameLibraryStatistics)
const mockedGetLibraryGames = vi.mocked(getLibraryGames)
const statistics: GameLibraryStatistics = {
  total_games: 4,
  total_platforms: 3,
  progress: { to_play: 2, played: 2 },
  formats: { physical: 2, digital: 1 },
}
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
    cover_url: null,
    platform: {
      igdb_id: 6,
      name: 'PC',
      abbreviation: 'PC',
      in_library: true,
    },
    media_format: 'digital',
    owned: true,
    play_status: 'playing',
  },
]

describe('resumen de videojuegos', () => {
  beforeEach(() => {
    mockedGetStatistics.mockReset()
    mockedGetLibraryGames.mockReset()
    mockedGetStatistics.mockResolvedValue(statistics)
    mockedGetLibraryGames.mockResolvedValue(games)
  })

  it('muestra los totales, el acceso a la biblioteca y las distribuciones', async () => {
    renderOverview()

    expect(
      await screen.findByRole('heading', { name: 'Videojuegos', level: 1 }),
    ).toBeTruthy()
    const totals = await screen.findByRole('group', {
      name: 'Totales de videojuegos',
    })
    expect(within(totals).getByText('4')).toBeTruthy()
    expect(within(totals).getByText('3')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Abrir mis videojuegos' }).getAttribute('href'),
    ).toBe('/biblioteca/videojuegos')
    expect(
      screen.getByRole('list', { name: 'Últimos videojuegos añadidos' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('figure', {
        name: 'Progreso: Jugados, 2; Por jugar, 2',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('figure', {
        name: 'Formato: Físicos, 2; Digitales, 1',
      }),
    ).toBeTruthy()
  })

  it('muestra ceros y estados vacíos sin calcular porcentajes inválidos', async () => {
    mockedGetStatistics.mockResolvedValue({
      total_games: 0,
      total_platforms: 0,
      progress: { to_play: 0, played: 0 },
      formats: { physical: 0, digital: 0 },
    })
    mockedGetLibraryGames.mockResolvedValue([])

    renderOverview()

    expect(
      await screen.findByText('Aún no has añadido ningún videojuego.'),
    ).toBeTruthy()
    expect(
      screen.getByText('Aún no hay videojuegos en tu biblioteca.'),
    ).toBeTruthy()
    expect(
      screen.getByText('Aún no tienes videojuegos en propiedad.'),
    ).toBeTruthy()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('muestra el estado de carga', () => {
    mockedGetStatistics.mockReturnValue(new Promise(() => undefined))
    mockedGetLibraryGames.mockReturnValue(new Promise(() => undefined))

    renderOverview()

    expect(screen.getByText('Cargando el resumen de videojuegos…')).toBeTruthy()
  })

  it('permite reintentar cuando falla la carga', async () => {
    mockedGetStatistics
      .mockRejectedValueOnce(new Error('Error de red'))
      .mockResolvedValueOnce(statistics)
    const user = userEvent.setup()
    renderOverview()

    expect(
      await screen.findByText('No se ha podido cargar el resumen de videojuegos.'),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByRole('group', { name: 'Totales de videojuegos' }),
    ).toBeTruthy()
    expect(mockedGetStatistics).toHaveBeenCalledTimes(2)
  })
})

function renderOverview() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={['/videojuegos']}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return render(<VideoGamesOverviewPage />, { wrapper: Wrapper })
}
