import type { ReactNode } from 'react'

import styles from './AppFrame.module.css'

type AppFrameProps = {
  children: ReactNode
  header: ReactNode
}

export function AppFrame({ children, header }: AppFrameProps) {
  return (
    <div className={styles.shell}>
      {header}
      <main className={styles.content}>{children}</main>
    </div>
  )
}
