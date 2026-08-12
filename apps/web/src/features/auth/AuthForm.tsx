import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { login, register } from './api'
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from './types'

type AuthMode = 'login' | 'register'

type AuthAttempt =
  | { mode: 'login'; credentials: LoginCredentials }
  | { mode: 'register'; credentials: RegisterCredentials }

type AuthFormProps = {
  onAuthenticated: (user: AuthUser) => void
}

function fieldValue(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? '')
}

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const mutation = useMutation({
    mutationFn: (attempt: AuthAttempt) =>
      attempt.mode === 'login'
        ? login(attempt.credentials)
        : register(attempt.credentials),
    onSuccess: onAuthenticated,
  })

  const isRegister = mode === 'register'

  function changeMode(nextMode: AuthMode) {
    mutation.reset()
    setMode(nextMode)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const email = fieldValue(form, 'email')
    const password = fieldValue(form, 'password')

    if (mode === 'register') {
      mutation.mutate({
        mode,
        credentials: {
          email,
          username: fieldValue(form, 'username'),
          password,
        },
      })
      return
    }

    mutation.mutate({ mode, credentials: { email, password } })
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-heading">
        <p className="eyebrow">Tu biblioteca empieza aquí</p>
        <h1 id="auth-title">
          {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
        </h1>
        <p>
          {isRegister
            ? 'Crea tu perfil para empezar a construir tu colección.'
            : 'Accede para continuar organizando tus videojuegos.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="field">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              minLength={3}
              maxLength={30}
              aria-describedby="username-help"
              required
              disabled={mutation.isPending}
            />
            <span id="username-help" className="field-help">
              Entre 3 y 30 caracteres.
            </span>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={mutation.isPending}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 12 : 1}
            maxLength={128}
            aria-describedby={isRegister ? 'password-help' : undefined}
            required
            disabled={mutation.isPending}
          />
          {isRegister && (
            <span id="password-help" className="field-help">
              Mínimo 12 caracteres.
            </span>
          )}
        </div>

        {mutation.isError && (
          <p className="form-message form-message-error" role="alert">
            {mutation.error.message}
          </p>
        )}

        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? 'Enviando…'
            : isRegister
              ? 'Crear cuenta'
              : 'Entrar'}
        </button>
      </form>

      <p className="auth-alternative">
        {isRegister ? '¿Ya tienes una cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
        <button
          className="text-button"
          type="button"
          onClick={() => changeMode(isRegister ? 'login' : 'register')}
          disabled={mutation.isPending}
        >
          {isRegister ? 'Inicia sesión' : 'Crear una cuenta'}
        </button>
      </p>
    </section>
  )
}