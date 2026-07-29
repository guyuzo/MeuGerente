/**
 * Alternador de poucas opcoes fixas, no padrao de pills da referencia: cada
 * opcao e uma pill solta sobre o canvas e a ativa recebe preenchimento
 * invertido solido (bg.surface-inverse + text.inverse).
 *
 * Substitui o trilho cheio de `bg.surface-inverse` da versao anterior
 * (designsystem.md secao 4): no light mode aquele trilho virava uma barra
 * preta pesada, brigando com o resto da tela em vez de so marcar a selecao.
 */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex flex-wrap gap-1.5 ${className}`}>
      {options.map((opcao) => {
        const ativo = opcao.value === value
        return (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(opcao.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              ativo
                ? 'bg-[var(--bg-surface-inverse)] text-[var(--text-inverse)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {opcao.label}
          </button>
        )
      })}
    </div>
  )
}
