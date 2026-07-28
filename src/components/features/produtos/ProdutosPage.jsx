import { useState } from 'react'
import { Card } from '../../ui/Card'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { useMarcas } from '../marcas/useMarcas'
import { useProdutos } from './useProdutos'
import { NovoProdutoForm } from './NovoProdutoForm'
import { ProdutoCard } from './ProdutoCard'
import { ProdutosKanban } from './ProdutosKanban'

const VISOES = [
  { value: 'lista', label: 'Lista' },
  { value: 'quadro', label: 'Quadro' },
]

export function ProdutosPage() {
  const { subcategorias } = useMarcas()
  const { produtos, adicionar, remover } = useProdutos()
  const [visao, setVisao] = useState('lista')

  function nomeSubcategoria(id) {
    return subcategorias.find((sub) => sub.id === id)?.nome
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Produtos</h1>
        <SegmentedControl options={VISOES} value={visao} onChange={setVisao} />
      </div>

      <Card>
        <NovoProdutoForm subcategorias={subcategorias} onAdicionar={adicionar} />
      </Card>

      {produtos.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)]">Nenhum produto cadastrado ainda.</p>
      ) : visao === 'quadro' ? (
        <ProdutosKanban produtos={produtos} subcategorias={subcategorias} onRemover={remover} />
      ) : (
        <div className="flex flex-col gap-2">
          {produtos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              nomeSubcategoria={nomeSubcategoria(produto.subcategoriaId)}
              onRemover={remover}
            />
          ))}
        </div>
      )}
    </div>
  )
}
