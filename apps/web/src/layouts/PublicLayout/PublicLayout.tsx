import { Outlet } from 'react-router-dom'

import { AppFrame } from '../../shared/ui/AppFrame/AppFrame'
import { AppHeader } from '../../shared/ui/AppHeader/AppHeader'
import styles from './PublicLayout.module.css'

export function PublicLayout() {
  return (
    <AppFrame
      header={
        <AppHeader homePath="/login">
          <p className={styles.claim}>Colecciona sin límites</p>
        </AppHeader>
      }
    >
      <Outlet />
    </AppFrame>
  )
}
