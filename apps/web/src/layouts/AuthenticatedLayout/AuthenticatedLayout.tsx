import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Outlet, useOutletContext } from 'react-router-dom'

import { logout } from '../../features/auth/api'
import { currentUserQueryKey } from '../../features/auth/session'
import type { AuthenticatedRouteContext } from '../../features/auth/SessionGuards'
import { AppFrame } from '../../shared/ui/AppFrame/AppFrame'
import { AppHeader } from '../../shared/ui/AppHeader/AppHeader'
import styles from './AuthenticatedLayout.module.css'

export function AuthenticatedLayout() {
  const { user } = useOutletContext<AuthenticatedRouteContext>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(currentUserQueryKey, null),
  })

  return (
    <AppFrame
      header={
        <AppHeader homePath="/">
          <button
            className={styles.menuToggle}
            type="button"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span className={styles.menuIcon} aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <nav
              id="main-menu"
              className={styles.menu}
              aria-label="Navegación principal"
            >
              <div className={styles.identity}>
                <span className={styles.displayName}>{user.display_name}</span>
                <span className={styles.email}>{user.email}</span>
              </div>
              <Link
                className={styles.menuLink}
                to="/"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <button
                className={styles.logoutButton}
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
              {logoutMutation.isError && (
                <p className={styles.error} role="alert">
                  {logoutMutation.error.message}
                </p>
              )}
            </nav>
          )}
        </AppHeader>
      }
    >
      <Outlet context={{ user }} />
    </AppFrame>
  )
}
