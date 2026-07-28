import { useMemo, useState } from 'react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { useCalendario } from './useCalendario'
import { todayISO, formatarDataLonga } from './utils'
import { PainelDoDia } from './PainelDoDia'
import { NovoItemForm } from './NovoItemForm'
import { CalendarioMensal } from './CalendarioMensal'
import { CalendarioAgenda } from './CalendarioAgenda'
import { PlanejarSemanaModal } from './PlanejarSemanaModal'
import { ItemCard } from './ItemCard'
import { useAmostras } from '../amostras/useAmostras'
import { useProdutos } from '../produtos/useProdutos'

const VISOES = [
  { value: 'dia', label: 'Dia' },
  { value: '3dias', label: '3 dias' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
]

export function CalendarioPage() {
  const hojeISO = todayISO()
  const { itens, adicionar, avancarStatus, remover } = useCalendario()
  const { amostras } = useAmostras()
  const { produtos } = useProdutos()
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO)
  const [visao, setVisao] = useState('mes')
  const [dataAncora, setDataAncora] = useState(hojeISO)
  const [modalPlanoAberto, setModalPlanoAberto] = useState(false)
  const [modalAvulsoAberto, setModalAvulsoAberto] = useState(false)

  const cursorMes = useMemo(() => {
    const [ano, mes] = dataAncora.split('-').map(Number)
    return { ano, mes: mes - 1 }
  }, [dataAncora])

  function mudarCursorMes(novoCursor) {
    setDataAncora(`${novoCursor.ano}-${String(novoCursor.mes + 1).padStart(2, '0')}-01`)
  }

  function nomeAmostra(id) {
    return amostras.find((amostra) => amostra.id === id)?.nome
  }

  function confirmarPlanejamento(itensPlanejados) {
    itensPlanejados.forEach((item) => adicionar(item))
  }

  function adicionarAvulso(dados) {
    adicionar(dados)
    setModalAvulsoAberto(false)
  }

  const itensDoDiaSelecionado = itens
    .filter((item) => item.data === diaSelecionado)
    .sort((a, b) => a.titulo.localeCompare(b.titulo))

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-3 flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={() => setModalPlanoAberto(true)}
            className="justify-center py-3 text-base"
          >
            🗓️ Planejar semana
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start">
              <SegmentedControl options={VISOES} value={visao} onChange={setVisao} />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalAvulsoAberto(true)}
              className="justify-center"
            >
              + Adicionar dia de gravação
            </Button>
          </div>
        </div>

        <PlanejarSemanaModal
          open={modalPlanoAberto}
          onClose={() => setModalPlanoAberto(false)}
          produtos={produtos}
          dataInicio={hojeISO}
          onConfirmar={confirmarPlanejamento}
        />

        <Modal open={modalAvulsoAberto} onClose={() => setModalAvulsoAberto(false)} title="Adicionar dia de gravação">
          <NovoItemForm hojeISO={hojeISO} amostras={amostras} onAdicionar={adicionarAvulso} />
        </Modal>

        {visao === 'mes' ? (
          <CalendarioMensal
            itens={itens}
            hojeISO={hojeISO}
            diaSelecionado={diaSelecionado}
            onSelecionarDia={setDiaSelecionado}
            cursor={cursorMes}
            onMudarCursor={mudarCursorMes}
          />
        ) : (
          <CalendarioAgenda
            itens={itens}
            hojeISO={hojeISO}
            diaSelecionado={diaSelecionado}
            onSelecionarDia={setDiaSelecionado}
            dataAncora={dataAncora}
            onMudarAncora={setDataAncora}
            dias={visao === 'dia' ? 1 : visao === '3dias' ? 3 : 7}
          />
        )}
      </Card>

      <PainelDoDia
        itens={itens}
        hojeISO={hojeISO}
        nomeAmostra={nomeAmostra}
        onAvancar={avancarStatus}
        onRemover={remover}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{formatarDataLonga(diaSelecionado)}</h2>
        {itensDoDiaSelecionado.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">Nada planejado para este dia.</p>
        ) : (
          itensDoDiaSelecionado.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              hojeISO={hojeISO}
              nomeAmostra={nomeAmostra(item.amostraId)}
              onAvancar={avancarStatus}
              onRemover={remover}
            />
          ))
        )}
      </section>
    </div>
  )
}
