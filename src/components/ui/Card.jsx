/**
 * Superficie base de card. Ver designsystem.md secao 3.5 (surface.raised)
 * e secao 2.5 (radius.lg).
 */
export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 ${className}`}
    >
      {children}
    </div>
  )
}
