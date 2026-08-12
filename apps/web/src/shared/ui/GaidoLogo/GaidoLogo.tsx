import styles from './GaidoLogo.module.css'

export function GaidoLogo() {
  return (
    <svg
      className={styles.logo}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Gaido"
    >
      <rect width="48" height="48" className={styles.symbol} />
      <path
        d="M10 9H38V17H19V31H30V27H25V21H39V39H10V9Z"
        className={styles.cutout}
      />
    </svg>
  )
}
