import './styles.css'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { GaidoLogo } from './components/GaidoLogo'
import { AuthForm } from './features/auth/AuthForm'
import { AuthenticatedHome } from './features/auth/AuthenticatedHome'
import { getCurrentUser } from './features/auth/api'

export const currentUserQueryKey = ['auth', 'current-user'] as const

export function App() {
  const queryClient = useQueryClient()
  const currentUserQuery = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    retry: false,
  })

  const content = currentUserQuery.isPending ? (
    <div className="session-status" role="status">
      <span className="loading-indicator" aria-hidden="true" />
      Comprobando sesión…
    </div>
  ) : currentUserQuery.isError ? (
    <section className="session-status" aria-labelledby="session-error-title">
      <h1 id="session-error-title">No hemos podido comprobar tu sesión</h1>
      <p>Comprueba que la API esté disponible y vuelve a intentarlo.</p>
      <button
        className="primary-button"
        type="button"
        onClick={() => void currentUserQuery.refetch()}
      >
        Reintentar
      </button>
    </section>
  ) : currentUserQuery.data ? (
    <AuthenticatedHome
      user={currentUserQuery.data}
      onLoggedOut={() => queryClient.setQueryData(currentUserQueryKey, null)}
    />
  ) : (
    <AuthForm
      onAuthenticated={(user) => queryClient.setQueryData(currentUserQueryKey, user)}
    />
  )

  return (
    <main className="app-shell">
      <header className="brand-header">
        <GaidoLogo />
        <span className="visually-hidden">Gaido</span>
      </header>
      {content}
    </main>
  )
}