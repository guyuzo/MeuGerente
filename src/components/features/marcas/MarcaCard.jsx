export function MarcaCard({ marca, subcategorias, onAlternarFavorita, onRemover }) {
  const nomesSubcategorias = subcategorias
    .filter((sub) => marca.subcategoriaIds.includes(sub.id))
    .map((sub) => sub.nome)
    .join(', ')

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] px-3 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{marca.nome}</span>
        {nomesSubcategorias && (
          <span className="truncate text-xs text-[var(--text-tertiary)]">{nomesSubcategorias}</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onAlternarFavorita(marca.id)}
          aria-label={marca.favorita ? 'Remover dos favoritos' : 'Marcar como favorita'}
          className={marca.favorita ? 'text-[var(--accent-warning)]' : 'text-[var(--text-tertiary)]'}
        >
          {marca.favorita ? '★' : '☆'}
        </button>
        <button
          type="button"
          onClick={() => onRemover(marca.id)}
          className="text-xs text-[var(--text-tertiary)]"
          aria-label={`Remover marca ${marca.nome}`}
        >
          Remover
        </button>
      </div>
    </div>
  )
}
