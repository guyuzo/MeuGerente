const TONE_CLASSES = {
  neutral: 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--accent-primary)] text-white',
  secondary: 'bg-[var(--accent-secondary)] text-[var(--text-inverse)]',
  success: 'bg-[var(--accent-success)] text-[var(--text-inverse)]',
  warning: 'bg-[var(--accent-warning)] text-[var(--text-inverse)]',
  critical: 'bg-[var(--accent-critical)] text-[var(--text-inverse)]',
}

/**
 * Pill de status/label. Ver designsystem.md secao 4 (pill badge de destaque).
 * `tone` mapeia para os tokens semanticos de acento — nao usa cor solta.
 */
export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
