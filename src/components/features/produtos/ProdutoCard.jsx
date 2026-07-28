import { Card } from '../../ui/Card'

export function ProdutoCard({ produto, nomeSubcategoria, onRemover }) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{produto.nome}</span>
        {nomeSubcategoria && (
          <span className="truncate text-xs text-[var(--text-tertiary)]">{nomeSubcategoria}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemover(produto.id)}
        className="shrink-0 text-xs text-[var(--text-tertiary)]"
        aria-label={`Remover produto ${produto.nome}`}
      >
        Remover
      </button>
    </Card>
  )
}
