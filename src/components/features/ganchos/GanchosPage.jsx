import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { useMarcas } from '../marcas/useMarcas'
import { useGanchos } from './useGanchos'
import { NovoGanchoForm } from './NovoGanchoForm'
import { GanchosLista } from './GanchosLista'
import { GanchosKanban } from './GanchosKanban'

const VISOES = [
  { value: 'lista', label: 'Lista' },
  { value: 'quadro', label: 'Quadro' },
]

export function GanchosPage() {
  const { subcategorias } = useMarcas()
  const { ganchos, adicionar, definirStatus, remover } = useGanchos()
  const [visao, setVisao] = useState('quadro')
  const [modalAberto, setModalAberto] = useState(false)

  function nomeSubcategoria(id) {
    return subcategorias.find((sub) => sub.id === id)?.nome
  }

  function handleAdicionar(dados) {
    adicionar(dados)
    setModalAberto(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Ganchos</h1>
        <div className="flex items-center gap-2">
          <SegmentedControl options={VISOES} value={visao} onChange={setVisao} />
          <Button variant="primary" size="sm" onClick={() => setModalAberto(true)}>
            + Adicionar gancho
          </Button>
        </div>
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Adicionar gancho">
        <NovoGanchoForm subcategorias={subcategorias} onAdicionar={handleAdicionar} />
      </Modal>

      {visao === 'quadro' ? (
        <GanchosKanban
          ganchos={ganchos}
          nomeSubcategoria={nomeSubcategoria}
          onDefinirStatus={definirStatus}
          onRemover={remover}
        />
      ) : (
        <GanchosLista
          ganchos={ganchos}
          nomeSubcategoria={nomeSubcategoria}
          onDefinirStatus={definirStatus}
          onRemover={remover}
        />
      )}
    </div>
  )
}
