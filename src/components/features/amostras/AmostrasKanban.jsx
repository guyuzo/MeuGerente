import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { STATUS_META, STATUS_SEQUENCIA, STATUS } from './constants'

const COLUNAS = [...STATUS_SEQUENCIA, STATUS.PARADA]

function CartaoColuna({ amostra, nomeMarca, onAvancar, onMarcarParada, onRemover }) {
  const podeAvancar = amostra.status !== STATUS.VENDEU && amostra.status !== STATUS.PARADA

  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm font-medium">{amostra.nome}</span>
      {nomeMarca && <span className="text-xs text-[var(--text-secondary)]">{nomeMarca}</span>}
      <div className="flex items-center gap-2">
        {podeAvancar && (
          <button
            type="button"
            onClick={() => onAvancar(amostra.id)}
            className="rounded-full bg-[var(--bg-surface-raised)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]"
          >
            Avançar →
          </button>
        )}
        {podeAvancar && (
          <button
            type="button"
            onClick={() => onMarcarParada(amostra.id)}
            className="text-xs text-[var(--text-tertiary)]"
          >
            Parar
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemover(amostra.id)}
          className="text-xs text-[var(--text-tertiary)]"
          aria-label="Remover amostra"
        >
          Remover
        </button>
      </div>
    </Card>
  )
}

// Quadro estilo kanban: uma coluna por status, rolagem horizontal no mobile.
export function AmostrasKanban({ amostras, nomeMarca, onAvancar, onMarcarParada, onRemover }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {COLUNAS.map((status) => {
        const amostrasDoStatus = amostras.filter((a) => a.status === status)
        return (
          <div key={status} className="flex w-64 shrink-0 flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
              <span className="text-xs text-[var(--text-tertiary)]">{amostrasDoStatus.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {amostrasDoStatus.length === 0 ? (
                <p className="px-1 text-xs text-[var(--text-tertiary)]">Vazio.</p>
              ) : (
                amostrasDoStatus.map((amostra) => (
                  <CartaoColuna
                    key={amostra.id}
                    amostra={amostra}
                    nomeMarca={nomeMarca(amostra.marcaId)}
                    onAvancar={onAvancar}
                    onMarcarParada={onMarcarParada}
                    onRemover={onRemover}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
