import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'

// Quadro estilo kanban: uma coluna por subcategoria (+ "Sem categoria"),
// rolagem horizontal no mobile — mesmo padrao de Ganchos/Amostras/Categorias.
export function ProdutosKanban({ produtos, subcategorias, onRemover }) {
  const colunas = [...subcategorias, { id: null, nome: 'Sem categoria' }]

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {colunas.map((sub) => {
        const produtosDaColuna = produtos.filter((produto) => produto.subcategoriaId === sub.id)
        if (sub.id === null && produtosDaColuna.length === 0) return null

        return (
          <div key={sub.id ?? 'sem-categoria'} className="flex w-64 shrink-0 flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Badge tone={sub.id ? 'primary' : 'neutral'}>{sub.nome}</Badge>
              <span className="text-xs text-[var(--text-tertiary)]">{produtosDaColuna.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {produtosDaColuna.length === 0 ? (
                <p className="px-1 text-xs text-[var(--text-tertiary)]">Vazio.</p>
              ) : (
                produtosDaColuna.map((produto) => (
                  <Card key={produto.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm">{produto.nome}</span>
                    <button
                      type="button"
                      onClick={() => onRemover(produto.id)}
                      className="shrink-0 text-xs text-[var(--text-tertiary)]"
                      aria-label={`Remover produto ${produto.nome}`}
                    >
                      Remover
                    </button>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
