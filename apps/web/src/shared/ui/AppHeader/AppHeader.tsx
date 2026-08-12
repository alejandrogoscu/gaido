import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { GaidoLogo } from '../GaidoLogo/GaidoLogo'
import styles from './AppHeader.module.css'

type AppHeaderProps = {
  children: ReactNode
  homePath: string
}

export function AppHeader({ children, homePath }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.homeLink} to={homePath} aria-label="Ir al inicio">
        <GaidoLogo />
      </Link>
      <div className={styles.actions}>{children}</div>
    </header>
  )
}
