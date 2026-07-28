// Placeholder ate existir uma marca grafica definitiva: monograma "MG"
// sobre accent-primary, mesmo radius.md usado em chips (designsystem.md 2.5).
export function Logo({ size = 28, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-primary)] font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      MG
    </span>
  )
}
