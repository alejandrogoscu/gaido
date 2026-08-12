import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from './types'

import { ApiError, apiRequest } from '../../shared/api/client'

const AUTH_PATH = '/api/v1/auth'

async function authenticate(
  path: '/login' | '/register',
  credentials: LoginCredentials | RegisterCredentials,
): Promise<AuthUser> {
  const response = await apiRequest(`${AUTH_PATH}${path}`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  })
  return (await response.json()) as AuthUser
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest(`${AUTH_PATH}/me`)
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
  await apiRequest(`${AUTH_PATH}/logout`, { method: 'POST' })
}
