import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '../../app/router'

const authenticatedUser = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada',
  display_name: 'Ada',
  created_at: '2026-08-12T12:00:00Z',
}

function mockResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function renderApp(initialPath = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialPath],
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return router
}

describe('autenticación', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('muestra el acceso cuando no existe una sesión', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp()

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Gaido' })).toBeTruthy()
    expect(screen.getByText('Colecciona sin límites')).toBeTruthy()
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeTruthy()
    expect(screen.getByPlaceholderText('Contraseña')).toBeTruthy()
  })

  it('navega entre acceso y registro mediante rutas públicas', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
    const router = renderApp()

    await screen.findByRole('heading', { name: 'Iniciar sesión' })
    await user.click(screen.getByRole('link', { name: 'Crear una cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Crear una cuenta' })).toBeTruthy()
    expect(router.state.location.pathname).toBe('/register')
  })

  it('inicia sesión con correo y contraseña', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))

    renderApp()
    await screen.findByRole('heading', { name: 'Iniciar sesión' })

    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'una-clave-segura')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ada' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeTruthy()
    expect(screen.queryByText('Colecciona sin límites')).toBeNull()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: 'ada@example.com',
          password: 'una-clave-segura',
        }),
      }),
    )
  })

  it('crea una cuenta e inicia la sesión automáticamente', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
      .mockResolvedValueOnce(mockResponse(201, authenticatedUser))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Ada')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'una-clave-segura')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ada' })).toBeTruthy()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'ada@example.com',
          username: 'Ada',
          password: 'una-clave-segura',
        }),
      }),
    )
  })

  it('muestra el error devuelto al rechazar el acceso', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
      .mockResolvedValueOnce(
        mockResponse(401, { detail: 'Correo o contraseña incorrectos' }),
      )

    renderApp()
    await screen.findByRole('heading', { name: 'Iniciar sesión' })

    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'clave-incorrecta')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Correo o contraseña incorrectos',
    )
  })

  it('recupera una sesión existente y permite cerrarla desde el menú', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))
      .mockResolvedValueOnce(mockResponse(204))

    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Hola, Ada' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('permite reintentar cuando no puede consultar la sesión', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockRejectedValueOnce(new Error('API no disponible'))
      .mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp()

    expect(
      await screen.findByRole('heading', {
        name: 'No hemos podido comprobar tu sesión',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
  })
})
