import { RiCloseLargeLine, RiMenuLine } from '@remixicon/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Link, Outlet, useMatches, useOutletContext } from 'react-router-dom'

import { logout } from '../../features/auth/api'
import type { AuthenticatedRouteContext } from '../../features/auth/SessionGuards'
import { currentUserQueryKey } from '../../features/auth/session'
import { AppFrame } from '../../shared/ui/AppFrame/AppFrame'
import { AppHeader } from '../../shared/ui/AppHeader/AppHeader'
import { SidePanel } from '../../shared/ui/SidePanel/SidePanel'
import styles from './AuthenticatedLayout.module.css'

type AuthenticatedRouteHandle = {
  hideAuthenticatedHeader?: boolean
}

export function AuthenticatedLayout() {
  const { user } = useOutletContext<AuthenticatedRouteContext>()
  const hideHeader = useMatches().some(
    (match) =>
      (match.handle as AuthenticatedRouteHandle | undefined)
        ?.hideAuthenticatedHeader,
  )
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(currentUserQueryKey, null),
  })

  return (
    <AppFrame
      header={
        hideHeader ? null : (
          <AppHeader homePath="/">
            <button
              ref={menuToggleRef}
              className={styles.menuToggle}
              type="button"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              aria-controls="main-menu"
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            >
              <RiMenuLine className={styles.menuIcon} aria-hidden="true" />
            </button>

            <SidePanel
              isOpen={isMenuOpen}
              label="Navegación principal"
              onClose={() => setIsMenuOpen(false)}
              returnFocusRef={menuToggleRef}
            >
              <nav
                id="main-menu"
                className={styles.menu}
                aria-label="Navegación principal"
              >
                <div className={styles.menuHeader}>
                  <div className={styles.identity}>
                    <span className={styles.displayName}>
                      {user.display_name}
                    </span>
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
                  <Link
                    className={styles.menuLink}
                    to="/biblioteca/videojuegos"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis videojuegos
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
            </SidePanel>
          </AppHeader>
        )
      }
    >
      <Outlet context={{ user }} />
    </AppFrame>
  )
}