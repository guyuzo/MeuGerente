import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { StatusBadge } from './StatusBadge'
import { STATUS } from './constants'
import { formatarDataCurta } from './utils'

export function ItemCard({ item, hojeISO, nomeAmostra, onAvancar, onRemover }) {
  const publicado = item.status === STATUS.PUBLICADO

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-md font-medium sm:truncate">{item.titulo}</span>
        <span className="text-xs text-[var(--text-secondary)]">
          {formatarDataCurta(item.data)}
          {nomeAmostra && ` · 📦 ${nomeAmostra}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <StatusBadge item={item} hojeISO={hojeISO} />
        {!publicado && (
          <Button variant="secondary" size="sm" onClick={() => onAvancar(item.id)}>
            Avançar
          </Button>
        )}
        <button
          type="button"
          onClick={() => onRemover(item.id)}
          className="text-xs text-[var(--text-tertiary)]"
          aria-label="Remover item"
        >
          Remover
        </button>
      </div>
    </Card>
  )
}
