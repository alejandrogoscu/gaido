import { useOutletContext } from 'react-router-dom'

import type { AuthenticatedRouteContext } from '../auth/SessionGuards'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user } = useOutletContext<AuthenticatedRouteContext>()

  return (
    <section className={styles.panel} aria-labelledby="home-title">
      <p className={styles.eyebrow}>Sesión iniciada</p>
      <h1 id="home-title" className={styles.title}>
        Hola, {user.display_name}
      </h1>
      <p className={styles.email}>{user.email}</p>
      <p className={styles.description}>
        Tu cuenta está lista. La biblioteca será el siguiente paso.
      </p>
    </section>
  )
}
