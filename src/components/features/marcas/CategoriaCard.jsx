import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { ConfirmModal } from '../../ui/ConfirmModal'
import { SubcategoriaCard } from './SubcategoriaCard'
import { MarcaCard } from './MarcaCard'
import { NovaMarcaForm } from './NovaMarcaForm'
import { ICONES_CATEGORIA } from '../../../lib/iconesCategorias'

export function CategoriaCard({
  categoria,
  subcategorias,
  marcas,
  onRemoverCategoria,
  onRemoverSubcategoria,
  onAdicionarMarca,
  onAlternarFavorita,
  onRemoverMarca,
}) {
  const [modalMarcaAberto, setModalMarcaAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState(null)

  const idsSubcategoria = subcategorias.map((sub) => sub.id)
  const marcasDaCategoria = marcas.filter((marca) =>
    marca.subcategoriaIds.some((id) => idsSubcategoria.includes(id)),
  )

  const Icone = ICONES_CATEGORIA[categoria.icone] ?? ICONES_CATEGORIA.Tag

  function handleAdicionarMarca(dados) {
    onAdicionarMarca(dados)
    setModalMarcaAberto(false)
  }

  function confirmarRemocao() {
    if (confirmacao.tipo === 'categoria') onRemoverCategoria(confirmacao.id)
    if (confirmacao.tipo === 'subcategoria') onRemoverSubcategoria(confirmacao.id)
    if (confirmacao.tipo === 'marca') onRemoverMarca(confirmacao.id)
    setConfirmacao(null)
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-lg font-semibold">
          <Icone size={20} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{categoria.nome}</span>
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setModalMarcaAberto(true)}>
            + Adicionar marca
          </Button>
          <button
            type="button"
            onClick={() => setConfirmacao({ tipo: 'categoria', id: categoria.id, nome: categoria.nome })}
            className="text-[var(--text-tertiary)] hover:text-[var(--accent-critical)]"
            aria-label={`Remover categoria ${categoria.nome}`}
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {subcategorias.map((sub) => (
          <SubcategoriaCard
            key={sub.id}
            subcategoria={sub}
            totalMarcas={marcas.filter((marca) => marca.subcategoriaIds.includes(sub.id)).length}
            onRemover={(id) => setConfirmacao({ tipo: 'subcategoria', id, nome: sub.nome })}
          />
        ))}
      </div>

      {marcasDaCategoria.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-[var(--border-subtle)] pt-3">
          <span className="text-xs text-[var(--text-tertiary)]">Marcas (opcional)</span>
          {marcasDaCategoria.map((marca) => (
            <MarcaCard
              key={marca.id}
              marca={marca}
              subcategorias={subcategorias}
              onAlternarFavorita={onAlternarFavorita}
              onRemover={(id) => setConfirmacao({ tipo: 'marca', id, nome: marca.nome })}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalMarcaAberto}
        onClose={() => setModalMarcaAberto(false)}
        title={`Adicionar marca em ${categoria.nome}`}
      >
        <NovaMarcaForm subcategorias={subcategorias} onAdicionar={handleAdicionarMarca} />
      </Modal>

      <ConfirmModal
        open={Boolean(confirmacao)}
        mensagem={confirmacao ? `Tem certeza que quer remover "${confirmacao.nome}"? Essa ação não pode ser desfeita.` : ''}
        onConfirmar={confirmarRemocao}
        onCancelar={() => setConfirmacao(null)}
      />
    </Card>
  )
}
