import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../shared/ui/Button/Button'
import { PageHeading } from '../../shared/ui/PageHeading/PageHeading'
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
  const [validationError, setValidationError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (attempt: AuthAttempt) =>
      attempt.mode === 'login'
        ? login(attempt.credentials)
        : register(attempt.credentials),
    onSuccess: onAuthenticated,
  })

  const isRegister = mode === 'register'
  const title = isRegister ? 'Crear una cuenta' : 'Iniciar sesión'
  const subtitle = isRegister
    ? 'Crea tu perfil para empezar a construir tu colección.'
    : 'Accede a tu cuenta para continuar con tu colección.'
  const errorMessage =
    validationError ?? (mutation.isError ? mutation.error.message : null)

  function clearValidationError() {
    setValidationError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)
    mutation.reset()

    const form = event.currentTarget
    const email = fieldValue(form, 'email')
    const password = fieldValue(form, 'password')

    if (mode === 'register') {
      const passwordConfirmation = fieldValue(form, 'passwordConfirmation')

      if (password !== passwordConfirmation) {
        setValidationError('Las contraseñas no coinciden')
        return
      }

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
      <PageHeading id="auth-title" title={title} subtitle={subtitle} />

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
              required
              disabled={mutation.isPending}
            />
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
            required
            disabled={mutation.isPending}
            onChange={clearValidationError}
          />
        </div>

        {isRegister && (
          <div className={styles.field}>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              placeholder="Repetir contraseña"
              aria-label="Repetir contraseña"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              aria-describedby={validationError ? 'auth-error' : undefined}
              aria-invalid={validationError !== null}
              required
              disabled={mutation.isPending}
              onChange={clearValidationError}
            />
          </div>
        )}

        {errorMessage && (
          <p id="auth-error" className={styles.error} role="alert">
            {errorMessage}
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
              : 'Iniciar sesión'}
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