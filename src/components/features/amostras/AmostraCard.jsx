import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { STATUS, STATUS_META } from './constants'

export function AmostraCard({ amostra, nomeMarca, onAvancar, onMarcarParada, onRemover }) {
  const meta = STATUS_META[amostra.status]
  const podeAvancar = amostra.status !== STATUS.VENDEU && amostra.status !== STATUS.PARADA
  const podeParar = amostra.status !== STATUS.VENDEU && amostra.status !== STATUS.PARADA

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-md font-medium">{amostra.nome}</span>
        {nomeMarca && <span className="text-xs text-[var(--text-secondary)]">{nomeMarca}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        {podeAvancar && (
          <Button variant="secondary" size="sm" onClick={() => onAvancar(amostra.id)}>
            Avançar
          </Button>
        )}
        {podeParar && (
          <button
            type="button"
            onClick={() => onMarcarParada(amostra.id)}
            className="text-xs text-[var(--text-tertiary)]"
          >
            Marcar parada
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
