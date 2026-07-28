import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '../../ui/Card'
import { ConfirmModal } from '../../ui/ConfirmModal'
import { SubcategoriaCard } from './SubcategoriaCard'
import { ICONES_CATEGORIA } from '../../../lib/iconesCategorias'

// Quadro estilo kanban: uma coluna por categoria, rolagem horizontal no
// mobile. Marcas ficam de fora do quadro (seguem secundarias, ver Lista).
export function CategoriasKanban({
  categorias,
  subcategorias,
  marcas,
  onRemoverCategoria,
  onRemoverSubcategoria,
}) {
  const [confirmacao, setConfirmacao] = useState(null)

  function confirmarRemocao() {
    if (confirmacao.tipo === 'categoria') onRemoverCategoria(confirmacao.id)
    if (confirmacao.tipo === 'subcategoria') onRemoverSubcategoria(confirmacao.id)
    setConfirmacao(null)
  }

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {categorias.map((categoria) => {
        const subcategoriasDaCategoria = subcategorias.filter((sub) => sub.categoriaId === categoria.id)
        const Icone = ICONES_CATEGORIA[categoria.icone] ?? ICONES_CATEGORIA.Tag

        return (
          <Card key={categoria.id} className="flex w-64 shrink-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-1">
              <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                <Icone size={16} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{categoria.nome}</span>
              </span>
              <button
                type="button"
                onClick={() => setConfirmacao({ tipo: 'categoria', id: categoria.id, nome: categoria.nome })}
                className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--accent-critical)]"
                aria-label={`Remover categoria ${categoria.nome}`}
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {subcategoriasDaCategoria.map((sub) => (
                <SubcategoriaCard
                  key={sub.id}
                  subcategoria={sub}
                  totalMarcas={marcas.filter((marca) => marca.subcategoriaIds.includes(sub.id)).length}
                  onRemover={(id) => setConfirmacao({ tipo: 'subcategoria', id, nome: sub.nome })}
                />
              ))}
            </div>
          </Card>
        )
      })}

      <ConfirmModal
        open={Boolean(confirmacao)}
        mensagem={confirmacao ? `Tem certeza que quer remover "${confirmacao.nome}"? Essa ação não pode ser desfeita.` : ''}
        onConfirmar={confirmarRemocao}
        onCancelar={() => setConfirmacao(null)}
      />
    </div>
  )
}
