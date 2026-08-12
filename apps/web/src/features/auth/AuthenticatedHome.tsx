import { useMutation } from '@tanstack/react-query'

import { logout } from './api'
import type { AuthUser } from './types'

type AuthenticatedHomeProps = {
  user: AuthUser
  onLoggedOut: () => void
}

export function AuthenticatedHome({ user, onLoggedOut }: AuthenticatedHomeProps) {
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: onLoggedOut,
  })

  return (
    <section className="session-panel" aria-labelledby="session-title">
      <p className="eyebrow">Sesión iniciada</p>
      <h1 id="session-title">Hola, {user.display_name}</h1>
      <p className="session-email">{user.email}</p>
      <p className="session-description">
        Tu cuenta está lista. La biblioteca será el siguiente paso.
      </p>

      {mutation.isError && (
        <p className="form-message form-message-error" role="alert">
          {mutation.error.message}
        </p>
      )}

      <button
        className="secondary-button"
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </section>
  )
}