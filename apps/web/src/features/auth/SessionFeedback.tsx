import { Button } from '../../shared/ui/Button/Button'
import styles from './SessionFeedback.module.css'

export function SessionLoading() {
  return (
    <div className={styles.status} role="status">
      <span className={styles.loadingIndicator} aria-hidden="true" />
      Comprobando sesión…
    </div>
  )
}

type SessionErrorProps = {
  onRetry: () => void
}

export function SessionError({ onRetry }: SessionErrorProps) {
  return (
    <section className={styles.status} aria-labelledby="session-error-title">
      <h1 id="session-error-title">No hemos podido comprobar tu sesión</h1>
      <p>Comprueba que la API esté disponible y vuelve a intentarlo.</p>
      <Button type="button" onClick={onRetry}>
        Reintentar
      </Button>
    </section>
  )
}
