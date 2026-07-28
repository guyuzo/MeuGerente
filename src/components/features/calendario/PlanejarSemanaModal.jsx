import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { adicionarDias, formatarDataCurta } from './utils'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]'

// Fluxo em 2 etapas: 1) configurar quantos dias, quantos videos por dia e
// quais produtos entram no planejamento (favoritar = postar todo santo dia,
// os demais entram em rodizio preenchendo o resto das vagas do dia); 2)
// revisar a distribuicao agrupada por dia antes de confirmar de verdade no
// calendario — pedido explicito do usuario ("mostra pra mim antes de
// implementar").
export function PlanejarSemanaModal({ open, onClose, produtos, dataInicio, onConfirmar }) {
  const [etapa, setEtapa] = useState('config')
  const [dias, setDias] = useState(7)
  const [videosPorDia, setVideosPorDia] = useState(1)
  const [selecionados, setSelecionados] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [itensGerados, setItensGerados] = useState([])

  function handleFechar() {
    setEtapa('config')
    setDias(7)
    setVideosPorDia(1)
    setSelecionados([])
    setFavoritos([])
    setItensGerados([])
    onClose()
  }

  function alternarSelecionado(produtoId) {
    setSelecionados((atual) =>
      atual.includes(produtoId) ? atual.filter((id) => id !== produtoId) : [...atual, produtoId],
    )
    setFavoritos((atual) => (selecionados.includes(produtoId) ? atual.filter((id) => id !== produtoId) : atual))
  }

  function alternarFavorito(produtoId) {
    setFavoritos((atual) => {
      const jaFavorito = atual.includes(produtoId)
      return jaFavorito ? atual.filter((id) => id !== produtoId) : [...atual, produtoId]
    })
    // favoritar um produto que ainda nao estava marcado ja o inclui no plano
    setSelecionados((atual) => (atual.includes(produtoId) ? atual : [...atual, produtoId]))
  }

  function gerarPlanejamento() {
    const favoritosSelecionados = selecionados.filter((id) => favoritos.includes(id))
    const rotativos = selecionados.filter((id) => !favoritos.includes(id))
    const gerados = []
    let cursor = 0

    for (let dia = 0; dia < dias; dia += 1) {
      const idsDoDia = [...favoritosSelecionados]
      const vagas = Math.max(0, videosPorDia - favoritosSelecionados.length)
      for (let v = 0; v < vagas && rotativos.length > 0; v += 1) {
        idsDoDia.push(rotativos[cursor % rotativos.length])
        cursor += 1
      }

      idsDoDia.forEach((produtoId, indice) => {
        const produto = produtos.find((p) => p.id === produtoId)
        if (!produto) return
        gerados.push({
          id: `plano-${dia}-${produtoId}-${indice}`,
          dia: dia + 1,
          data: adicionarDias(dataInicio, dia),
          titulo: produto.nome,
          produtoId,
        })
      })
    }

    setItensGerados(gerados)
    setEtapa('preview')
  }

  function removerItem(id) {
    setItensGerados((atual) => atual.filter((item) => item.id !== id))
  }

  function confirmar() {
    onConfirmar(itensGerados.map(({ data, titulo, produtoId }) => ({ data, titulo, produtoId })))
    handleFechar()
  }

  const favoritosSelecionadosCount = selecionados.filter((id) => favoritos.includes(id)).length
  const excedeVideosPorDia = favoritosSelecionadosCount > videosPorDia

  const dePorDia = itensGerados.reduce((grupos, item) => {
    const grupo = grupos.find((g) => g.dia === item.dia)
    if (grupo) grupo.itens.push(item)
    else grupos.push({ dia: item.dia, data: item.data, itens: [item] })
    return grupos
  }, [])

  return (
    <Modal open={open} onClose={handleFechar} title={etapa === 'config' ? 'Planejar semana' : 'Confira seu planejamento'}>
      {etapa === 'config' ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-[var(--text-secondary)]">Quantos dias você vai planejar</span>
              <input
                type="number"
                min={1}
                max={31}
                value={dias}
                onChange={(evento) => setDias(Math.max(1, Number(evento.target.value) || 1))}
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-[var(--text-secondary)]">Vídeos por dia</span>
              <input
                type="number"
                min={1}
                max={10}
                value={videosPorDia}
                onChange={(evento) => setVideosPorDia(Math.max(1, Number(evento.target.value) || 1))}
                className={INPUT_CLASSES}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-[var(--text-secondary)]">Produtos</span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Marque os produtos que entram no planejamento. Favorite (★) um produto para postá-lo todos os dias — os
              demais se revezam preenchendo o resto das vagas do dia.
            </span>
          </div>

          {produtos.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)]">
              Nenhum produto cadastrado. Cadastre produtos primeiro.
            </p>
          ) : (
            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {produtos.map((produto) => {
                const marcado = selecionados.includes(produto.id)
                const favorito = favoritos.includes(produto.id)
                return (
                  <div
                    key={produto.id}
                    className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarSelecionado(produto.id)}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{produto.nome}</span>
                    <button
                      type="button"
                      onClick={() => alternarFavorito(produto.id)}
                      aria-label={favorito ? `Não postar ${produto.nome} todos os dias` : `Postar ${produto.nome} todos os dias`}
                      className={favorito ? 'shrink-0 text-[var(--accent-warning)]' : 'shrink-0 text-[var(--text-tertiary)]'}
                    >
                      {favorito ? '★' : '☆'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {excedeVideosPorDia && (
            <p className="text-xs text-[var(--accent-warning)]">
              Você tem {favoritosSelecionadosCount} produtos favoritados para todo dia, mais que os {videosPorDia}{' '}
              vídeos/dia definidos — eles serão postados todo dia mesmo assim.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-sm">
            <span className="text-[var(--text-secondary)]">Produtos selecionados</span>
            <span className="font-semibold">{selecionados.length}</span>
          </div>

          <Button
            variant="primary"
            className="justify-center"
            disabled={selecionados.length === 0}
            onClick={gerarPlanejamento}
          >
            Ver planejamento
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dePorDia.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)]">Nada selecionado.</p>
          ) : (
            <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
              {dePorDia.map((grupo) => (
                <div key={grupo.dia} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">Dia {grupo.dia}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatarDataCurta(grupo.data)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {grupo.itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] px-2 py-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm">{item.titulo}</span>
                        <button
                          type="button"
                          onClick={() => removerItem(item.id)}
                          className="shrink-0 text-xs text-[var(--text-tertiary)]"
                          aria-label={`Remover ${item.titulo} do dia ${grupo.dia}`}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 justify-center" onClick={() => setEtapa('config')}>
              Voltar
            </Button>
            <Button
              variant="primary"
              className="flex-1 justify-center"
              disabled={itensGerados.length === 0}
              onClick={confirmar}
            >
              Confirmar no calendário
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
