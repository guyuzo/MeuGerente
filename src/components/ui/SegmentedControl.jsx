/**
 * Segmented control conforme designsystem.md secao 4: trilho em
 * bg.surface-inverse, item ativo em bg.surface + elevation.1, radius.button
 * no container e no item ativo. Usado como alternativa visual a <select>
 * nativo quando as opcoes sao poucas e fixas.
 */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-1 rounded-full bg-[var(--bg-surface-inverse)] p-1 ${className}`}>
      {options.map((opcao) => {
        const ativo = opcao.value === value
        return (
          <button
            key={opcao.value}
            type="button"
            onClick={() => onChange(opcao.value)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              ativo
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-elevation-1)]'
                : 'text-[var(--text-inverse)]'
            }`}
          >
            {opcao.label}
          </button>
        )
      })}
    </div>
  )
}
