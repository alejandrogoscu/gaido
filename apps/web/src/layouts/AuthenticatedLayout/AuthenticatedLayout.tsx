import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RiCloseLargeLine, RiMenuLine } from '@remixicon/react'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isMenuOpen])

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
            <RiMenuLine className={styles.menuIcon} aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className={styles.backdrop}
                aria-hidden="true"
                onClick={() => setIsMenuOpen(false)}
              />
              <nav
                id="main-menu"
                className={styles.menu}
                aria-label="Navegación principal"
              >
                <div className={styles.menuHeader}>
                  <div className={styles.identity}>
                    <span className={styles.displayName}>{user.display_name}</span>
                    <span className={styles.email}>{user.email}</span>
                  </div>
                  <button
                    className={styles.closeButton}
                    type="button"
                    aria-label="Cerrar panel de navegación"
                    autoFocus
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <RiCloseLargeLine
                      className={styles.closeIcon}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className={styles.menuNavigation}>
                  <Link
                    className={styles.menuLink}
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                </div>

                <div className={styles.menuFooter}>
                  <button
                    className={styles.logoutButton}
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending
                      ? 'Cerrando sesión…'
                      : 'Cerrar sesión'}
                  </button>
                  {logoutMutation.isError && (
                    <p className={styles.error} role="alert">
                      {logoutMutation.error.message}
                    </p>
                  )}
                </div>
              </nav>
            </>
          )}
        </AppHeader>
      }
    >
      <Outlet context={{ user }} />
    </AppFrame>
  )
}