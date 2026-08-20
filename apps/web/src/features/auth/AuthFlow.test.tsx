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
    expect(
      screen.getByText('Accede a tu cuenta para continuar con tu colección.'),
    ).toBeTruthy()
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeTruthy()
    expect(screen.getByPlaceholderText('Contraseña')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Mostrar la contraseña' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('meter', { name: 'Fortaleza de la contraseña' }),
    ).toBeNull()
  })

  it('navega entre acceso y registro mediante rutas públicas', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
    const router = renderApp()

    await screen.findByRole('heading', { name: 'Iniciar sesión' })
    await user.click(screen.getByRole('link', { name: 'Crear una cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Crear una cuenta' })).toBeTruthy()
    expect(
      screen.getByText('Crea tu perfil para empezar a construir tu colección.'),
    ).toBeTruthy()
    expect(screen.getByLabelText('Repetir contraseña')).toBeTruthy()
    expect(screen.queryByText('Entre 3 y 30 caracteres.')).toBeNull()
    expect(screen.queryByText('Mínimo 12 caracteres.')).toBeNull()
    expect(router.state.location.pathname).toBe('/register')
  })

  it('permite mostrar y ocultar las contraseñas de forma independiente', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    const password = screen.getByLabelText('Contraseña')
    const passwordConfirmation = screen.getByLabelText('Repetir contraseña')

    expect(password.getAttribute('type')).toBe('password')
    expect(passwordConfirmation.getAttribute('type')).toBe('password')

    await user.click(
      screen.getByRole('button', { name: 'Mostrar la contraseña' }),
    )

    expect(password.getAttribute('type')).toBe('text')
    expect(passwordConfirmation.getAttribute('type')).toBe('password')
    expect(
      screen.getByRole('button', { name: 'Ocultar la contraseña' }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Mostrar la contraseña repetida' }),
    )

    expect(passwordConfirmation.getAttribute('type')).toBe('text')
  })

  it('confirma visualmente un nombre de usuario y un correo válidos', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    const username = screen.getByLabelText('Nombre de usuario')
    const email = screen.getByLabelText('Correo electrónico')

    expect(username.getAttribute('maxlength')).toBe('20')
    expect(screen.queryByRole('img', { name: 'Nombre de usuario válido' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'Correo electrónico válido' })).toBeNull()

    await user.type(username, 'ab')
    await user.type(email, 'correo-invalido')

    expect(screen.queryByRole('img', { name: 'Nombre de usuario válido' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'Correo electrónico válido' })).toBeNull()

    await user.type(username, 'c_12-test')
    await user.clear(email)
    await user.type(email, 'ada@example.com')

    expect(
      screen.getByRole('img', { name: 'Nombre de usuario válido' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('img', { name: 'Correo electrónico válido' }),
    ).toBeTruthy()

    await user.type(username, '.')

    expect(screen.queryByRole('img', { name: 'Nombre de usuario válido' })).toBeNull()
  })

  it('estima la fortaleza de la contraseña del registro en cinco niveles', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    const password = screen.getByLabelText('Contraseña')
    const passwordConfirmation = screen.getByLabelText('Repetir contraseña')

    expect(
      screen.queryByRole('meter', { name: 'Fortaleza de la contraseña' }),
    ).toBeNull()

    await user.click(password)

    const strength = screen.getByRole('meter', {
      name: 'Fortaleza de la contraseña',
    })

    expect(strength.getAttribute('aria-valuetext')).toBe('Sin evaluar')
    expect(strength.textContent).toBe('')

    for (const [value, label] of [
      ['abc', 'Muy débil'],
      ['abcdefgh', 'Débil'],
      ['Abcdefghij12', 'Normal'],
      ['Abcdefghij1!', 'Fuerte'],
      ['Abcdefghijklmn1!', 'Muy fuerte'],
    ]) {
      await user.clear(password)
      await user.type(password, value)
      expect(strength.getAttribute('aria-valuetext')).toBe(label)
      expect(strength.textContent).toBe('')
    }

    await user.click(
      screen.getByRole('button', { name: 'Mostrar la contraseña' }),
    )

    expect(
      screen.getByRole('meter', { name: 'Fortaleza de la contraseña' }),
    ).toBeTruthy()

    await user.click(passwordConfirmation)

    expect(
      screen.queryByRole('meter', { name: 'Fortaleza de la contraseña' }),
    ).toBeNull()
  })

  it('inicia sesión con correo y contraseña', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))
      .mockResolvedValueOnce(mockResponse(200, []))

    renderApp()
    await screen.findByRole('heading', { name: 'Iniciar sesión' })

    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'una-clave-segura')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeTruthy()
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
      .mockResolvedValueOnce(mockResponse(200, []))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Ada')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'una-clave-segura')
    await user.type(
      screen.getByLabelText('Repetir contraseña'),
      'una-clave-segura',
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeTruthy()
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

  it('no envía el registro cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: 'No autenticado' }))

    renderApp('/register')
    await screen.findByRole('heading', { name: 'Crear una cuenta' })

    await user.type(screen.getByLabelText('Nombre de usuario'), 'Ada')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'una-clave-segura')
    await user.type(
      screen.getByLabelText('Repetir contraseña'),
      'otra-clave-segura',
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Las contraseñas no coinciden',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
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
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Correo o contraseña incorrectos',
    )
  })

  it('recupera una sesión existente y permite cerrarla desde el menú', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))
      .mockResolvedValueOnce(mockResponse(200, []))
      .mockResolvedValueOnce(mockResponse(204))

    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('oculta la cabecera global en la biblioteca de videojuegos', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))
      .mockResolvedValueOnce(mockResponse(200, []))

    renderApp('/biblioteca/videojuegos')

    expect(
      await screen.findByRole('heading', { name: 'Mis videojuegos' }),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeTruthy()
    expect(screen.queryByRole('img', { name: 'Gaido' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).toBeNull()
  })

  it('abre y cierra el panel de navegación autenticado', async () => {
    const user = userEvent.setup()
    fetchMock
      .mockResolvedValueOnce(mockResponse(200, authenticatedUser))
      .mockResolvedValueOnce(mockResponse(200, []))

    renderApp('/')
    await screen.findByRole('heading', { name: 'Inicio' })

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    const menu = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(menu.textContent).toContain('Ada')
    expect(menu.textContent).toContain('ada@example.com')
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Mis videojuegos' }),
    ).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')

    const closeButton = screen.getByRole('button', {
      name: 'Cerrar panel de navegación',
    })
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(document.activeElement).toBe(closeButton)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(logoutButton)
    await user.tab()
    expect(document.activeElement).toBe(closeButton)

    await user.click(closeButton)

    expect(
      screen.queryByRole('navigation', { name: 'Navegación principal' }),
    ).toBeNull()
    expect(document.body.style.overflow).toBe('')

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('navigation', { name: 'Navegación principal' }),
    ).toBeNull()
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