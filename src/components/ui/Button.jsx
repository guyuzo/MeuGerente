const VARIANT_CLASSES = {
  primary: 'bg-[var(--accent-primary)] text-white',
  secondary: 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)]',
  critical: 'bg-[var(--accent-critical)] text-[var(--text-inverse)]',
}

const SIZE_CLASSES = {
  md: 'px-5 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

/**
 * Botao base do sistema. Formato capsula (radius-full), conforme
 * designsystem.md secao 4 (radius.button).
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-opacity active:opacity-80 disabled:opacity-40 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
