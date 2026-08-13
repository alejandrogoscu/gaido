import styles from './PasswordStrength.module.css'

const STRENGTH_LABELS = [
  'Muy débil',
  'Débil',
  'Normal',
  'Fuerte',
  'Muy fuerte',
] as const

type StrengthLevel = 0 | 1 | 2 | 3 | 4

type PasswordStrengthProps = {
  password: string
}

function characterVariety(password: string): number {
  return [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
}

function calculateStrength(password: string): StrengthLevel | null {
  if (password.length === 0) {
    return null
  }
  if (password.length < 8) {
    return 0
  }
  if (password.length < 12) {
    return 1
  }

  const variety = characterVariety(password)
  let score = 1

  if (password.length >= 16) score += 1
  if (password.length >= 20) score += 1
  if (variety >= 3) score += 1
  if (variety === 4) score += 1

  return Math.min(score, 4) as StrengthLevel
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const level = calculateStrength(password)
  const label = level === null ? 'Sin evaluar' : STRENGTH_LABELS[level]

  return (
    <div
      className={styles.meter}
      data-strength={level ?? undefined}
      role="meter"
      aria-label="Fortaleza de la contraseña"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={level === null ? 0 : level + 1}
      aria-valuetext={label}
      aria-live="polite"
    >
      <div className={styles.bars} aria-hidden="true">
        {STRENGTH_LABELS.map((strengthLabel, index) => (
          <span
            className={`${styles.bar} ${level !== null && index <= level ? styles.barActive : ''}`}
            key={strengthLabel}
          />
        ))}
      </div>
    </div>
  )
}