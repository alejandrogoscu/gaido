import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../shared/api/client'
import { getGameDetail } from './api'
import { GameDetailPage } from './GameDetailPage'
import type { GameDetail } from './types'

vi.mock('./api', () => ({
  getGameDetail: vi.fn(),
  getGameLibraryStatistics: vi.fn(),
  getLibraryGames: vi.fn(),
}))

const mockedGetGameDetail = vi.mocked(getGameDetail)
const game: GameDetail = {
  game_id: 1,
  igdb_id: 338106,
  title: 'Donkey Kong Bananza',
  summary: 'Explora un enorme mundo subterráneo.',
  cover_url: 'https://images.example/donkey-kong.jpg',
  platforms: [
    {
      igdb_id: 508,
      name: 'Nintendo Switch 2',
      abbreviation: 'Switch 2',
      in_library: true,
    },
    {
      igdb_id: 130,
      name: 'Nintendo Switch',
      abbreviation: 'Switch',
      in_library: false,
    },
  ],
  library_entry: {
    id: 1,
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
}

describe('detalle de un videojuego', () => {
  beforeEach(() => {
    mockedGetGameDetail.mockReset()
    mockedGetGameDetail.mockResolvedValue(game)
  })

  it('muestra el título junto a la portada, los datos y la sinopsis', async () => {
    renderDetail()

    expect(
      await screen.findByRole('heading', { name: 'Donkey Kong Bananza' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('img', { name: 'Portada de Donkey Kong Bananza' }),
    ).toBeTruthy()
    expect(screen.queryByText('Propiedad')).toBeNull()
    expect(screen.getByText('Lo tengo')).toBeTruthy()
    expect(screen.getByText('Nintendo Switch 2')).toBeTruthy()
    expect(screen.getByText('Completado')).toBeTruthy()
    expect(
      screen.getByText('Explora un enorme mundo subterráneo.'),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Ratings' })).toBeTruthy()
    expect(
      screen.getByLabelText('Sin valoraciones disponibles'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Editar' }).hasAttribute('disabled')).toBe(
      true,
    )
    expect(screen.getByRole('button', { name: 'Compartir' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy()
    expect(mockedGetGameDetail).toHaveBeenCalledWith(338106, 1)
  })

  it('representa una entrada pendiente y sin sinopsis', async () => {
    mockedGetGameDetail.mockResolvedValue({
      ...game,
      summary: null,
      library_entry: {
        ...game.library_entry!,
        owned: false,
        play_status: 'pending',
      },
    })

    renderDetail()

    expect(await screen.findByText('Pendiente')).toBeTruthy()
    expect(screen.queryByText('No lo tengo')).toBeNull()
    expect(screen.getByText('No hay una sinopsis disponible.')).toBeTruthy()
  })

  it('indica que no se posee cuando se está jugando o ya se ha jugado', async () => {
    mockedGetGameDetail.mockResolvedValue({
      ...game,
      library_entry: {
        ...game.library_entry!,
        owned: false,
        play_status: 'completed',
      },
    })

    renderDetail()

    expect(await screen.findByText('No lo tengo')).toBeTruthy()
    expect(screen.getByText('Completado')).toBeTruthy()
  })

  it('muestra todas las plataformas cuando no existe una entrada personal', async () => {
    mockedGetGameDetail.mockResolvedValue({ ...game, library_entry: null })

    renderDetail('/videojuegos/338106')

    expect(await screen.findByText('Switch 2')).toBeTruthy()
    expect(screen.getByText('Switch')).toBeTruthy()
    expect(screen.queryByText('Estado')).toBeNull()
    expect(screen.queryByText('Lo tengo')).toBeNull()
  })

  it('muestra el estado de carga', () => {
    mockedGetGameDetail.mockReturnValue(new Promise(() => undefined))

    renderDetail()

    expect(screen.getByText('Cargando el videojuego…')).toBeTruthy()
  })

  it('muestra una entrada inexistente sin reintento', async () => {
    mockedGetGameDetail.mockRejectedValue(
      new ApiError('El videojuego no está en tu biblioteca', 404),
    )

    renderDetail()

    expect(
      await screen.findByText('No se ha encontrado el videojuego.'),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })

  it('permite reintentar cuando falla la carga', async () => {
    mockedGetGameDetail
      .mockRejectedValueOnce(new ApiError('Error de red', 0))
      .mockResolvedValueOnce(game)
    const user = userEvent.setup()
    renderDetail()

    expect(
      await screen.findByText('No se ha podido cargar el videojuego.'),
    ).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByRole('heading', { name: 'Donkey Kong Bananza' }),
    ).toBeTruthy()
    expect(mockedGetGameDetail).toHaveBeenCalledTimes(2)
  })
})

function renderDetail(initialPath = '/videojuegos/338106?entrada=1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/videojuegos/:igdbGameId" element={children} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return render(<GameDetailPage />, { wrapper: Wrapper })
}
