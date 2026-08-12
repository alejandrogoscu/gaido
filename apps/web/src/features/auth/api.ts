import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from './types'

const AUTH_PATH = '/api/v1/auth'

type ValidationDetail = {
  msg?: string
}

type ErrorPayload = {
  detail?: string | ValidationDetail[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function errorMessage(response: Response): Promise<string> {
  const fallback = 'No se ha podido completar la solicitud'

  try {
    const payload = (await response.json()) as ErrorPayload

    if (typeof payload.detail === 'string') {
      return payload.detail
    }

    const validationMessage = payload.detail?.find(
      (detail) => typeof detail.msg === 'string',
    )?.msg
    return validationMessage ?? fallback
  } catch {
    return fallback
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let response: Response

  try {
    response = await fetch(`${AUTH_PATH}${path}`, {
      ...init,
      credentials: 'include',
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    })
  } catch {
    throw new ApiError('No se ha podido conectar con el servidor', 0)
  }

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status)
  }

  return response
}

async function authenticate(
  path: '/login' | '/register',
  credentials: LoginCredentials | RegisterCredentials,
): Promise<AuthUser> {
  const response = await request(path, {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  return (await response.json()) as AuthUser
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await request('/me')
    return (await response.json()) as AuthUser
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export function login(credentials: LoginCredentials): Promise<AuthUser> {
  return authenticate('/login', credentials)
}

export function register(credentials: RegisterCredentials): Promise<AuthUser> {
  return authenticate('/register', credentials)
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' })
}