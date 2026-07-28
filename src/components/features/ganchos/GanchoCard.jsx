import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { STATUS, STATUS_META, FORMATO_META } from './constants'

function acaoDeAvanco(status) {
  if (status === STATUS.PARA_TESTAR) return { proximo: STATUS.VALIDADO, label: 'Marcar como validado' }
  return null
}

export function GanchoCard({ gancho, nomeSubcategoria, onDefinirStatus, onRemover }) {
  const avanco = acaoDeAvanco(gancho.status)
  const meta = STATUS_META[gancho.status]

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-md font-medium">{gancho.texto}</span>
        <span className="text-xs text-[var(--text-secondary)]">
          {FORMATO_META[gancho.formato]}
          {nomeSubcategoria ? ` · ${nomeSubcategoria}` : ''}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        {avanco && (
          <Button variant="secondary" size="sm" onClick={() => onDefinirStatus(gancho.id, avanco.proximo)}>
            {avanco.label}
          </Button>
        )}
        {gancho.status === STATUS.VALIDADO && (
          <button
            type="button"
            onClick={() => onDefinirStatus(gancho.id, STATUS.PARA_TESTAR)}
            className="text-xs text-[var(--text-tertiary)]"
          >
            Voltar para testar
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemover(gancho.id)}
          className="text-xs text-[var(--text-tertiary)]"
          aria-label="Remover gancho"
        >
          Remover
        </button>
      </div>
    </Card>
  )
}
