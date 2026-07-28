import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { STATUS, STATUS_META, STATUS_ORDEM, FORMATO_META } from './constants'

function acaoDeAvanco(status) {
  if (status === STATUS.PARA_TESTAR) return { proximo: STATUS.VALIDADO, label: 'Validar' }
  return null
}

function CartaoColuna({ gancho, nomeSubcategoria, onDefinirStatus, onRemover }) {
  const avanco = acaoDeAvanco(gancho.status)
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-sm font-medium">{gancho.texto}</span>
      <span className="text-xs text-[var(--text-secondary)]">
        {FORMATO_META[gancho.formato]}
        {nomeSubcategoria ? ` · ${nomeSubcategoria}` : ''}
      </span>
      <div className="flex items-center gap-2">
        {avanco && (
          <button
            type="button"
            onClick={() => onDefinirStatus(gancho.id, avanco.proximo)}
            className="rounded-full bg-[var(--bg-surface-raised)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]"
          >
            {avanco.label} →
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

// Quadro estilo kanban: uma coluna por status, rolagem horizontal no mobile.
export function GanchosKanban({ ganchos, nomeSubcategoria, onDefinirStatus, onRemover }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {STATUS_ORDEM.map((status) => {
        const ganchosDoStatus = ganchos.filter((g) => g.status === status)
        return (
          <div key={status} className="flex w-64 shrink-0 flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
              <span className="text-xs text-[var(--text-tertiary)]">{ganchosDoStatus.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {ganchosDoStatus.length === 0 ? (
                <p className="px-1 text-xs text-[var(--text-tertiary)]">Vazio.</p>
              ) : (
                ganchosDoStatus.map((gancho) => (
                  <CartaoColuna
                    key={gancho.id}
                    gancho={gancho}
                    nomeSubcategoria={nomeSubcategoria(gancho.subcategoriaId)}
                    onDefinirStatus={onDefinirStatus}
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
