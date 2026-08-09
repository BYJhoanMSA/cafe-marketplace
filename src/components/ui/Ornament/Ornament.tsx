import styles from './Ornament.module.css'

interface OrnamentProps {
  tone?: 'dark' | 'light'
  className?: string
}

export function Ornament({ tone = 'dark', className }: OrnamentProps) {
  return (
    <div
      className={`${styles.rule} ${className ?? ''}`}
      data-tone={tone}
      aria-hidden="true"
    >
      <span className={styles.diamond} />
    </div>
  )
}
