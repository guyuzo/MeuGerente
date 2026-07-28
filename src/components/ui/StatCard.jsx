import { Card } from './Card'

/**
 * Card de metrica: label pequeno + numero grande em destaque (type.data-lg,
 * designsystem.md secao 3.3), com legenda opcional abaixo.
 */
export function StatCard({ label, value, legenda, className = '' }) {
  return (
    <Card className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {legenda && <span className="text-xs text-[var(--text-tertiary)]">{legenda}</span>}
    </Card>
  )
}
