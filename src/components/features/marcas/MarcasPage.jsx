import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { CategoriaCard } from './CategoriaCard'
import { CategoriasKanban } from './CategoriasKanban'
import { NovaCategoriaForm } from './NovaCategoriaForm'
import { NovaSubcategoriaForm } from './NovaSubcategoriaForm'
import { useMarcas } from './useMarcas'

const VISOES = [
  { value: 'lista', label: 'Lista' },
  { value: 'quadro', label: 'Quadro' },
]

const TIPOS_NOVO = [
  { value: 'categoria', label: 'Categoria' },
  { value: 'subcategoria', label: 'Subcategoria' },
]

export function MarcasPage() {
  const {
    categorias,
    subcategorias,
    marcas,
    adicionarCategoria,
    removerCategoria,
    adicionarSubcategoria,
    removerSubcategoria,
    adicionarMarca,
    alternarFavorita,
    removerMarca,
  } = useMarcas()
  const [visao, setVisao] = useState('lista')
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoNovo, setTipoNovo] = useState('categoria')

  function handleAdicionarCategoria(nome, emoji) {
    adicionarCategoria(nome, emoji)
    setModalAberto(false)
  }

  function handleAdicionarSubcategoria(categoriaId, nome) {
    adicionarSubcategoria(categoriaId, nome)
    setModalAberto(false)
  }

  function abrirModal() {
    setTipoNovo(categorias.length === 0 ? 'categoria' : tipoNovo)
    setModalAberto(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Categorias</h1>
        <div className="flex items-center gap-2">
          <SegmentedControl options={VISOES} value={visao} onChange={setVisao} />
          <Button variant="primary" size="sm" onClick={abrirModal}>
            + Adicionar
          </Button>
        </div>
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Adicionar">
        <div className="flex flex-col gap-3">
          {categorias.length > 0 && (
            <SegmentedControl options={TIPOS_NOVO} value={tipoNovo} onChange={setTipoNovo} />
          )}
          {tipoNovo === 'subcategoria' && categorias.length > 0 ? (
            <NovaSubcategoriaForm categorias={categorias} onAdicionar={handleAdicionarSubcategoria} />
          ) : (
            <NovaCategoriaForm onAdicionar={handleAdicionarCategoria} />
          )}
        </div>
      </Modal>

      {categorias.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">
          Nenhuma categoria cadastrada ainda. Clique em "+ Adicionar" para começar.
        </p>
      ) : visao === 'quadro' ? (
        <CategoriasKanban
          categorias={categorias}
          subcategorias={subcategorias}
          marcas={marcas}
          onRemoverCategoria={removerCategoria}
          onRemoverSubcategoria={removerSubcategoria}
        />
      ) : (
        categorias.map((categoria) => (
          <CategoriaCard
            key={categoria.id}
            categoria={categoria}
            subcategorias={subcategorias.filter((sub) => sub.categoriaId === categoria.id)}
            marcas={marcas}
            onRemoverCategoria={removerCategoria}
            onRemoverSubcategoria={removerSubcategoria}
            onAdicionarMarca={adicionarMarca}
            onAlternarFavorita={alternarFavorita}
            onRemoverMarca={removerMarca}
          />
        ))
      )}
    </div>
  )
}
