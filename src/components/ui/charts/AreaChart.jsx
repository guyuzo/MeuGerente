import { useState } from 'react'
import { ChartTooltip } from './ChartTooltip'
import { useLarguraElemento, escalaLimpa, listaDeTicks } from './utils'

const PAD = { topo: 16, direita: 14, baixo: 26, esquerda: 38 }
const ALTURA_PLOT = 168

/**
 * Serie unica ao longo do tempo. Linha de 2px, preenchimento de area a 10%
 * de opacidade e ponto final com anel da superficie — sem legenda, porque
 * uma serie so ja e nomeada pelo titulo do card.
 */
export function AreaChart({
  dados,
  cor = 'var(--chart-1)',
  formatarValor = (valor) => String(valor),
  rotuloTooltip = (ponto) => ponto.label,
  inteiro = false,
}) {
  const [ref, largura] = useLarguraElemento()
  const [indiceAtivo, setIndiceAtivo] = useState(null)

  const alturaTotal = ALTURA_PLOT + PAD.topo + PAD.baixo
  const larguraPlot = Math.max(0, largura - PAD.esquerda - PAD.direita)
  const base = PAD.topo + ALTURA_PLOT

  const { max: topo, passo } = escalaLimpa(
    Math.max(...dados.map((d) => d.valor), 0),
    4,
    inteiro,
  )

  const posX = (indice) =>
    dados.length <= 1
      ? PAD.esquerda + larguraPlot / 2
      : PAD.esquerda + (indice / (dados.length - 1)) * larguraPlot
  const posY = (valor) => base - (valor / topo) * ALTURA_PLOT

  const pontos = dados.map((ponto, indice) => [posX(indice), posY(ponto.valor)])
  const traco = pontos.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  const preenchimento =
    pontos.length > 0 ? `${traco} L${pontos.at(-1)[0]} ${base} L${pontos[0][0]} ${base} Z` : ''

  const ultimoIndice = dados.length - 1
  const pontoAtivo = indiceAtivo === null ? null : dados[indiceAtivo]

  function aoMover(evento) {
    if (larguraPlot <= 0 || dados.length === 0) return
    const caixa = evento.currentTarget.getBoundingClientRect()
    const relativo = evento.clientX - caixa.left - PAD.esquerda
    const fracao = dados.length <= 1 ? 0 : relativo / larguraPlot
    const indice = Math.round(fracao * (dados.length - 1))
    setIndiceAtivo(Math.min(Math.max(indice, 0), ultimoIndice))
  }

  function aoTeclar(evento) {
    if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return
    evento.preventDefault()
    const passoTeclado = evento.key === 'ArrowRight' ? 1 : -1
    setIndiceAtivo((atual) => {
      const proximo = (atual === null ? 0 : atual) + passoTeclado
      return Math.min(Math.max(proximo, 0), ultimoIndice)
    })
  }

  return (
    <div ref={ref} className="relative w-full min-w-0">
      {largura > 0 && (
        <svg
          width={largura}
          height={alturaTotal}
          role="img"
          aria-label={`Gráfico de área. ${dados.map((d) => `${d.label}: ${formatarValor(d.valor)}`).join('. ')}`}
          tabIndex={0}
          className="block outline-none"
          onMouseMove={aoMover}
          onMouseLeave={() => setIndiceAtivo(null)}
          onKeyDown={aoTeclar}
          onBlur={() => setIndiceAtivo(null)}
        >
          {listaDeTicks(topo, passo).map((valor) => (
            <g key={valor}>
              <line
                x1={PAD.esquerda}
                x2={largura - PAD.direita}
                y1={posY(valor)}
                y2={posY(valor)}
                stroke="var(--chart-grid)"
                strokeWidth={1}
              />
              <text
                x={PAD.esquerda - 8}
                y={posY(valor) + 3}
                textAnchor="end"
                className="fill-[var(--text-tertiary)] text-[10px] [font-variant-numeric:tabular-nums]"
              >
                {valor}
              </text>
            </g>
          ))}

          <path d={preenchimento} fill={cor} opacity={0.1} />
          <path
            d={traco}
            fill="none"
            stroke={cor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rotulos rareados conforme a largura disponivel: no mobile 14 datas
              lado a lado viram um borrao sobreposto.
              O rareamento e ancorado no FIM da serie — contando de tras para
              frente o dia mais recente sempre aparece e o espacamento fica
              uniforme. Ancorar no inicio e depois forcar o ultimo produzia
              dois rotulos colados na borda direita. */}
          {dados.map((ponto, indice) => {
            const cabem = Math.max(2, Math.floor(larguraPlot / 32))
            const intervalo = Math.ceil(dados.length / cabem)
            if ((ultimoIndice - indice) % intervalo !== 0) return null
            return (
              <text
                key={ponto.label}
                x={posX(indice)}
                y={alturaTotal - 8}
                textAnchor="middle"
                className="fill-[var(--text-tertiary)] text-[10px]"
              >
                {ponto.label}
              </text>
            )
          })}

          {indiceAtivo !== null && (
            <line
              x1={posX(indiceAtivo)}
              x2={posX(indiceAtivo)}
              y1={PAD.topo}
              y2={base}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
          )}

          {/* Ponto final: rotulo direto do ultimo valor, ancorado no fim para
              nunca vazar a borda direita do card. */}
          {pontos.length > 0 && (
            <>
              <circle
                cx={pontos.at(-1)[0]}
                cy={pontos.at(-1)[1]}
                r={4.5}
                fill={cor}
                stroke="var(--chart-surface)"
                strokeWidth={2}
              />
              <text
                x={largura - PAD.direita}
                y={Math.max(pontos.at(-1)[1] - 12, PAD.topo + 4)}
                textAnchor="end"
                className="fill-[var(--text-primary)] text-[11px] font-semibold [font-variant-numeric:tabular-nums]"
              >
                {formatarValor(dados.at(-1).valor)}
              </text>
            </>
          )}

          {indiceAtivo !== null && indiceAtivo !== ultimoIndice && (
            <circle
              cx={posX(indiceAtivo)}
              cy={posY(dados[indiceAtivo].valor)}
              r={4.5}
              fill={cor}
              stroke="var(--chart-surface)"
              strokeWidth={2}
            />
          )}
        </svg>
      )}

      {pontoAtivo && (
        <ChartTooltip
          x={posX(indiceAtivo)}
          y={posY(pontoAtivo.valor)}
          largura={largura}
          titulo={rotuloTooltip(pontoAtivo)}
          valor={formatarValor(pontoAtivo.valor)}
        />
      )}
    </div>
  )
}
