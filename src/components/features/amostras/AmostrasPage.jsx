import { useState } from 'react'
import { Card } from '../../ui/Card'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { useMarcas } from '../marcas/useMarcas'
import { useAmostras } from './useAmostras'
import { NovaAmostraForm } from './NovaAmostraForm'
import { AmostraCard } from './AmostraCard'
import { AmostrasKanban } from './AmostrasKanban'
import { STATUS_META } from './constants'

const VISOES = [
  { value: 'lista', label: 'Lista' },
  { value: 'quadro', label: 'Quadro' },
]

export function AmostrasPage() {
  const { marcas } = useMarcas()
  const { amostras, adicionar, avancar, marcarParada, remover } = useAmostras()
  const [filtro, setFiltro] = useState('todas')
  const [visao, setVisao] = useState('lista')

  function nomeMarca(id) {
    return marcas.find((marca) => marca.id === id)?.nome
  }

  const amostrasFiltradas = filtro === 'todas' ? amostras : amostras.filter((a) => a.status === filtro)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <NovaAmostraForm marcas={marcas} onAdicionar={adicionar} />
      </Card>

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Amostras</h1>
        <SegmentedControl options={VISOES} value={visao} onChange={setVisao} />
      </div>

      {visao === 'quadro' ? (
        <AmostrasKanban
          amostras={amostras}
          nomeMarca={nomeMarca}
          onAvancar={avancar}
          onMarcarParada={marcarParada}
          onRemover={remover}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltro('todas')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filtro === 'todas'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
              }`}
            >
              Todas ({amostras.length})
            </button>
            {Object.entries(STATUS_META).map(([valor, meta]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltro(valor)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filtro === valor
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
                }`}
              >
                {meta.label} ({amostras.filter((a) => a.status === valor).length})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {amostrasFiltradas.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Nenhuma amostra aqui ainda.</p>
            ) : (
              amostrasFiltradas.map((amostra) => (
                <AmostraCard
                  key={amostra.id}
                  amostra={amostra}
                  nomeMarca={nomeMarca(amostra.marcaId)}
                  onAvancar={avancar}
                  onMarcarParada={marcarParada}
                  onRemover={remover}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
