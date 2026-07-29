// Acentos claros (ciano/verde/ouro/rosa) levam tinta escura fixa
// (`text-on-accent`) em vez de `text-inverse`: no light mode text-inverse vira
// branco e o badge cai para ~1.4:1 de contraste. Roxo e a excecao — e escuro
// o bastante para branco (4.78:1 contra 3.52:1 com tinta escura).
const TONE_CLASSES = {
  neutral: 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--accent-primary)] text-white',
  secondary: 'bg-[var(--accent-secondary)] text-[var(--text-on-accent)]',
  success: 'bg-[var(--accent-success)] text-[var(--text-on-accent)]',
  warning: 'bg-[var(--accent-warning)] text-[var(--text-on-accent)]',
  critical: 'bg-[var(--accent-critical)] text-[var(--text-on-accent)]',
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
