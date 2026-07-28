// Um pouco mais rico que um chip simples: mostra quantas marcas estao
// vinculadas, alem do nome, ocupando uma celula do grid de subcategorias.
export function SubcategoriaCard({ subcategoria, totalMarcas, onRemover }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] px-3 py-2">
      <div className="flex items-start justify-between gap-1">
        <span className="truncate text-sm font-medium">{subcategoria.nome}</span>
        <button
          type="button"
          onClick={() => onRemover(subcategoria.id)}
          className="shrink-0 text-[var(--text-tertiary)]"
          aria-label={`Remover subcategoria ${subcategoria.nome}`}
        >
          ×
        </button>
      </div>
      <span className="text-xs text-[var(--text-tertiary)]">
        {totalMarcas > 0 ? `${totalMarcas} marca${totalMarcas > 1 ? 's' : ''}` : 'sem marcas ainda'}
      </span>
    </div>
  )
}
