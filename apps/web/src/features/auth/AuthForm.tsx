import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../shared/ui/Button/Button'
import { login, register } from './api'
import styles from './AuthForm.module.css'
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from './types'

export type AuthMode = 'login' | 'register'

type AuthAttempt =
  | { mode: 'login'; credentials: LoginCredentials }
  | { mode: 'register'; credentials: RegisterCredentials }

type AuthFormProps = {
  mode: AuthMode
  onAuthenticated: (user: AuthUser) => void
}

function fieldValue(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? '')
}

export function AuthForm({ mode, onAuthenticated }: AuthFormProps) {
  const mutation = useMutation({
    mutationFn: (attempt: AuthAttempt) =>
      attempt.mode === 'login'
        ? login(attempt.credentials)
        : register(attempt.credentials),
    onSuccess: onAuthenticated,
  })

  const isRegister = mode === 'register'

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
    <section className={styles.panel} aria-labelledby="auth-title">
      <div className={styles.heading}>
        <h1 id="auth-title" className={styles.title}>
          {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
        </h1>
        {isRegister && (
          <p className={styles.description}>
            Crea tu perfil para empezar a construir tu colección.
          </p>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {isRegister && (
          <div className={styles.field}>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nombre de usuario"
              aria-label="Nombre de usuario"
              autoComplete="username"
              minLength={3}
              maxLength={30}
              aria-describedby="username-help"
              required
              disabled={mutation.isPending}
            />
            <span id="username-help" className={styles.fieldHelp}>
              Entre 3 y 30 caracteres.
            </span>
          </div>
        )}

        <div className={styles.field}>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            aria-label="Correo electrónico"
            autoComplete="email"
            maxLength={254}
            required
            disabled={mutation.isPending}
          />
        </div>

        <div className={styles.field}>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 12 : 1}
            maxLength={128}
            aria-describedby={isRegister ? 'password-help' : undefined}
            required
            disabled={mutation.isPending}
          />
          {isRegister && (
            <span id="password-help" className={styles.fieldHelp}>
              Mínimo 12 caracteres.
            </span>
          )}
        </div>

        {mutation.isError && (
          <p className={styles.error} role="alert">
            {mutation.error.message}
          </p>
        )}

        <Button
          className={styles.submit}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Enviando…'
            : isRegister
              ? 'Crear cuenta'
              : 'Entrar'}
        </Button>
      </form>

      <p className={styles.alternative}>
        {isRegister ? '¿Ya tienes una cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
        <Link
          className={styles.alternativeLink}
          to={isRegister ? '/login' : '/register'}
        >
          {isRegister ? 'Inicia sesión' : 'Crear una cuenta'}
        </Link>
      </p>
    </section>
  )
}
