import styles from './PageHeading.module.css'

type PageHeadingProps = {
  id: string
  subtitle: string
  title: string
}

export function PageHeading({ id, subtitle, title }: PageHeadingProps) {
  return (
    <header className={styles.heading}>
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  )
}