import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../shared/api/client'
import { addLibraryGame, getLibraryGames, searchGames } from '../games/api'
import type { GameSearchResult, LibraryGame } from '../games/types'
import { HomePage } from './HomePage'

vi.mock('../games/api', () => ({
  addLibraryGame: vi.fn(),
  getLibraryGames: vi.fn(),
  searchGames: vi.fn(),
}))

const mockedAddLibraryGame = vi.mocked(addLibraryGame)
const mockedGetLibraryGames = vi.mocked(getLibraryGames)
const mockedSearchGames = vi.mocked(searchGames)

const donkeyKong: LibraryGame = {
  id: 1,
  game_id: 1,
  igdb_game_id: 338106,
  title: 'Donkey Kong Bananza',
  cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobd1q.jpg',
  platform: {
    igdb_id: 508,
    name: 'Nintendo Switch 2',
    abbreviation: 'Switch 2',
    in_library: true,
  },
  media_format: 'digital',
  owned: true,
  play_status: 'completed',
}
const donkeyKongSearchResult: GameSearchResult = {
  game_id: null,
  igdb_id: 338106,
  title: 'Donkey Kong Bananza',
  summary: 'Explore a vast underground world.',
  first_release_date: '2025-07-17',
  cover_url: donkeyKong.cover_url,
  platforms: [{ ...donkeyKong.platform, in_library: false }],
  in_library: false,
}

describe('inicio de colecciones', () => {
  beforeEach(() => {
    mockedGetLibraryGames.mockReset()
    mockedSearchGames.mockReset()
    mockedAddLibraryGame.mockReset()
    mockedGetLibraryGames.mockResolvedValue([])
  })

  it('muestra la biblioteca vacía y conserva los accesos de colección', async () => {
    renderHome()

    expect(
      await screen.findByText('Aún no has añadido ningún videojuego.'),
    ).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Buscar videojuegos' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Videojuegos' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Cómics' })).toBeTruthy()
    expect(screen.getByText('Saga')).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    const videoGamesShortcut = screen.getByRole('button', {
      name: 'Videojuegos',
    })
    const comicsShortcut = screen.getByRole('button', { name: 'Cómics' })
    expect(videoGamesShortcut.hasAttribute('disabled')).toBe(true)
    expect(comicsShortcut.hasAttribute('disabled')).toBe(true)
  })

  it('configura y añade una edición a la biblioteca', async () => {
    let library: LibraryGame[] = []
    mockedGetLibraryGames.mockImplementation(() => Promise.resolve(library))
    mockedSearchGames.mockResolvedValue([donkeyKongSearchResult])
    mockedAddLibraryGame.mockImplementation(() => {
      library = [donkeyKong]
      return Promise.resolve(donkeyKong)
    })
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    const searchDialog = await screen.findByRole('dialog', {
      name: 'Buscar videojuegos',
    })
    await user.type(
      within(searchDialog).getByRole('searchbox', {
        name: 'Buscar videojuegos',
      }),
      'Donkey Kong Bananza{Enter}',
    )

    expect(await screen.findByText('2025')).toBeTruthy()
    expect(screen.getByText('Switch 2')).toBeTruthy()

    await user.click(
      screen.getByRole('button', {
        name: 'Añadir Donkey Kong Bananza a la biblioteca',
      }),
    )

    const configuration = await screen.findByRole('dialog', {
      name: 'Configurar Donkey Kong Bananza',
    })
    await user.click(within(configuration).getByRole('radio', {
      name: 'Switch 2',
    }))
    await user.click(within(configuration).getByRole('radio', {
      name: 'Lo tengo',
    }))
    await user.click(within(configuration).getByRole('radio', {
      name: 'Digital',
    }))
    await user.click(within(configuration).getByRole('radio', {
      name: 'Completado',
    }))

    await user.click(within(configuration).getByRole('button', {
      name: 'Añadir a la biblioteca',
    }))

    expect(mockedAddLibraryGame).toHaveBeenCalledWith(
      {
        igdb_game_id: 338106,
        igdb_platform_id: 508,
        media_format: 'digital',
        owned: true,
        play_status: 'completed',
      },
      expect.anything(),
    )
    expect(
      await screen.findByRole('img', { name: 'Donkey Kong Bananza' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('dialog', {
        name: 'Configurar Donkey Kong Bananza',
      }),
    ).toBeNull()
    expect(
      screen.getByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeTruthy()
  })

  it('cierra solo la configuración al pulsar Escape', async () => {
    mockedSearchGames.mockResolvedValue([donkeyKongSearchResult])
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    const searchDialog = await screen.findByRole('dialog', {
      name: 'Buscar videojuegos',
    })
    await user.type(
      within(searchDialog).getByRole('searchbox', {
        name: 'Buscar videojuegos',
      }),
      'Donkey Kong Bananza{Enter}',
    )
    await user.click(
      await screen.findByRole('button', {
        name: 'Añadir Donkey Kong Bananza a la biblioteca',
      }),
    )
    await screen.findByRole('dialog', {
      name: 'Configurar Donkey Kong Bananza',
    })

    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('dialog', {
        name: 'Configurar Donkey Kong Bananza',
      }),
    ).toBeNull()
    expect(
      screen.getByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeTruthy()
  })

  it('mantiene abierto el panel cuando falla el alta', async () => {
    mockedSearchGames.mockResolvedValue([donkeyKongSearchResult])
    mockedAddLibraryGame.mockRejectedValue(
      new ApiError('Esta edición ya está en tu biblioteca', 409),
    )
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    await user.type(
      within(
        await screen.findByRole('dialog', { name: 'Buscar videojuegos' }),
      ).getByRole('searchbox', { name: 'Buscar videojuegos' }),
      'Donkey Kong Bananza{Enter}',
    )
    await user.click(
      await screen.findByRole('button', {
        name: 'Añadir Donkey Kong Bananza a la biblioteca',
      }),
    )

    const configuration = await screen.findByRole('dialog', {
      name: 'Configurar Donkey Kong Bananza',
    })
    await user.click(
      within(configuration).getByRole('radio', { name: 'Switch 2' }),
    )
    await user.click(
      within(configuration).getByRole('button', {
        name: 'Añadir a la biblioteca',
      }),
    )

    expect((await within(configuration).findByRole('alert')).textContent).toBe(
      'Esta edición ya está en tu biblioteca',
    )
    expect(configuration.isConnected).toBe(true)
  })

  it('identifica las plataformas que ya están en la biblioteca', async () => {
    mockedSearchGames.mockResolvedValue([
      {
        ...donkeyKongSearchResult,
        game_id: donkeyKong.game_id,
        in_library: true,
        platforms: [donkeyKong.platform],
      },
    ])
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    await user.type(
      within(
        await screen.findByRole('dialog', { name: 'Buscar videojuegos' }),
      ).getByRole('searchbox', { name: 'Buscar videojuegos' }),
      'Donkey Kong Bananza{Enter}',
    )

    expect(await screen.findByText('Lo tengo')).toBeTruthy()
    expect(
      screen.getByText('Nintendo Switch 2, en tu biblioteca'),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', {
          name: 'Donkey Kong Bananza ya está en tu biblioteca',
        })
        .hasAttribute('disabled'),
    ).toBe(true)
  })

  it('permite añadir el mismo juego en otra plataforma', async () => {
    mockedSearchGames.mockResolvedValue([
      {
        ...donkeyKongSearchResult,
        game_id: donkeyKong.game_id,
        in_library: true,
        platforms: [
          donkeyKong.platform,
          {
            igdb_id: 6,
            name: 'PC',
            abbreviation: 'PC',
            in_library: false,
          },
        ],
      },
    ])
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    await user.type(
      within(
        await screen.findByRole('dialog', { name: 'Buscar videojuegos' }),
      ).getByRole('searchbox', { name: 'Buscar videojuegos' }),
      'Donkey Kong Bananza{Enter}',
    )
    await user.click(
      await screen.findByRole('button', {
        name: 'Añadir Donkey Kong Bananza a la biblioteca',
      }),
    )

    const configuration = await screen.findByRole('dialog', {
      name: 'Configurar Donkey Kong Bananza',
    })
    expect(
      within(configuration)
        .getByRole('radio', { name: /Switch 2/ })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(
      within(configuration)
        .getByRole('radio', { name: 'PC' })
        .hasAttribute('disabled'),
    ).toBe(false)
  })

  it('muestra los errores de búsqueda del backend', async () => {
    mockedSearchGames.mockRejectedValue(
      new ApiError('No se ha podido consultar el catálogo de videojuegos', 502),
    )
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )
    const searchDialog = await screen.findByRole('dialog', {
      name: 'Buscar videojuegos',
    })
    await user.type(
      within(searchDialog).getByRole('searchbox', {
        name: 'Buscar videojuegos',
      }),
      'Hades{Enter}',
    )

    expect(
      await screen.findByText(
        'No se ha podido consultar el catálogo de videojuegos',
      ),
    ).toBeTruthy()
  })

  it('mantiene deshabilitadas las rutas de colección todavía no disponibles', async () => {
    renderHome()
    await screen.findByText('Aún no has añadido ningún videojuego.')

    const viewAllActions = screen.getAllByRole('button', {
      name: /^Ver todos:/,
    })

    expect(viewAllActions).toHaveLength(2)
    expect(viewAllActions.every((action) => action.hasAttribute('disabled'))).toBe(
      true,
    )
  })

  it('cierra la búsqueda sin volver a abrirla al restaurar el foco', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('searchbox', { name: 'Buscar videojuegos' }),
    )

    expect(
      await screen.findByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    await user.type(
      within(screen.getByRole('dialog', { name: 'Buscar videojuegos' })).getByRole(
        'searchbox',
        { name: 'Buscar videojuegos' },
      ),
      'Hades',
    )

    await user.click(screen.getByRole('button', { name: 'Cerrar búsqueda' }))

    expect(
      screen.queryByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Abrir búsqueda' }),
      )
    })
    expect(
      (
        screen.getByRole('searchbox', {
          name: 'Buscar videojuegos',
        }) as HTMLInputElement
      ).value,
    ).toBe('')

    await user.click(screen.getByRole('button', { name: 'Abrir búsqueda' }))
    expect(
      await screen.findByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('dialog', { name: 'Buscar videojuegos' }),
    ).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })
})

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return render(<HomePage />, { wrapper: Wrapper })
}