import { isAtrasado } from './utils'
import { ItemCard } from './ItemCard'

// View dedicada de "o que precisa ser gravado hoje" (prd.md secao 6.1),
// separada da grade mensal — nao e so mais um dia no calendario.
export function PainelDoDia({ itens, hojeISO, nomeAmostra, onAvancar, onRemover }) {
  const atrasados = itens.filter((item) => isAtrasado(item, hojeISO))
  const deHoje = itens.filter(
    (item) => item.data === hojeISO && !isAtrasado(item, hojeISO),
  )

  if (atrasados.length === 0 && deHoje.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-4 text-center text-sm text-[var(--text-secondary)]">
        Nada para gravar hoje. Adicione um item abaixo.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {atrasados.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[var(--accent-critical)]">
            Atrasados ({atrasados.length})
          </h2>
          {atrasados.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              hojeISO={hojeISO}
              nomeAmostra={nomeAmostra?.(item.amostraId)}
              onAvancar={onAvancar}
              onRemover={onRemover}
            />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Para gravar hoje ({deHoje.length})</h2>
        {deHoje.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">Nada agendado para hoje.</p>
        ) : (
          deHoje.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              hojeISO={hojeISO}
              nomeAmostra={nomeAmostra?.(item.amostraId)}
              onAvancar={onAvancar}
              onRemover={onRemover}
            />
          ))
        )}
      </section>
    </div>
  )
}
