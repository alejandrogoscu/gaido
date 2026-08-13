import { useMutation } from '@tanstack/react-query'
import { RiCheckLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react'
import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type FormEvent,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../shared/ui/Button/Button'
import { PageHeading } from '../../shared/ui/PageHeading/PageHeading'
import { login, register } from './api'
import styles from './AuthForm.module.css'
import { PasswordStrength } from './PasswordStrength'
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

type PasswordFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  visibilityLabel: string
}

type ValidatedFieldProps = ComponentProps<'input'> & {
  isValidValue: (value: string) => boolean
  validLabel: string
}

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fieldValue(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? '')
}

function ValidatedField({
  isValidValue,
  onChange,
  validLabel,
  ...inputProps
}: ValidatedFieldProps) {
  const [isValid, setIsValid] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setIsValid(isValidValue(event.currentTarget.value))
    onChange?.(event)
  }

  return (
    <div className={`${styles.field} ${styles.validatedField}`}>
      <input {...inputProps} onChange={handleChange} />
      {isValid && (
        <RiCheckLine
          className={styles.validIndicator}
          role="img"
          aria-label={`${validLabel} válido`}
        />
      )}
    </div>
  )
}

function PasswordField({
  disabled,
  visibilityLabel,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const action = isVisible ? 'Ocultar' : 'Mostrar'

  return (
    <div className={`${styles.field} ${styles.passwordField}`}>
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
      />
      <button
        className={styles.visibilityToggle}
        type="button"
        aria-label={`${action} ${visibilityLabel}`}
        aria-pressed={isVisible}
        disabled={disabled}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? (
          <RiEyeOffLine
            className={styles.visibilityIcon}
            aria-hidden="true"
          />
        ) : (
          <RiEyeLine
            className={styles.visibilityIcon}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  )
}

export function AuthForm({ mode, onAuthenticated }: AuthFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isPasswordActive, setIsPasswordActive] = useState(false)
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

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    clearValidationError()
    setPassword(event.currentTarget.value)
  }

  function handlePasswordGroupBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null

    if (!event.currentTarget.contains(nextTarget)) {
      setIsPasswordActive(false)
    }
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
          <ValidatedField
            id="username"
            name="username"
            type="text"
            placeholder="Nombre de usuario"
            aria-label="Nombre de usuario"
            validLabel="Nombre de usuario"
            isValidValue={(value) => USERNAME_PATTERN.test(value)}
            autoComplete="username"
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_-]+"
            required
            disabled={mutation.isPending}
          />
        )}

        {isRegister ? (
          <ValidatedField
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            aria-label="Correo electrónico"
            validLabel="Correo electrónico"
            isValidValue={(value) => EMAIL_PATTERN.test(value)}
            autoComplete="email"
            maxLength={254}
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            required
            disabled={mutation.isPending}
          />
        ) : (
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
        )}

        <div
          className={styles.passwordGroup}
          onFocus={() => setIsPasswordActive(true)}
          onBlur={handlePasswordGroupBlur}
        >
          <PasswordField
            id="password"
            name="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            visibilityLabel="la contraseña"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 12 : 1}
            maxLength={128}
            required
            disabled={mutation.isPending}
            onChange={handlePasswordChange}
          />
          {isRegister && isPasswordActive && (
            <PasswordStrength password={password} />
          )}
        </div>

        {isRegister && (
          <PasswordField
            id="passwordConfirmation"
            name="passwordConfirmation"
            placeholder="Repetir contraseña"
            aria-label="Repetir contraseña"
            visibilityLabel="la contraseña repetida"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            aria-describedby={validationError ? 'auth-error' : undefined}
            aria-invalid={validationError !== null}
            required
            disabled={mutation.isPending}
            onChange={clearValidationError}
          />
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