import { useState } from 'react'
import { ChartTooltip } from './ChartTooltip'
import {
  useLarguraElemento,
  escalaLimpa,
  listaDeTicks,
  caminhoBarra,
  ESPESSURA_MAX_BARRA,
} from './utils'

const PAD = { topo: 16, direita: 8, baixo: 26, esquerda: 44 }
const ALTURA_PLOT = 168

/**
 * Comparacao de magnitude entre periodos. Serie unica, uma cor so para todas
 * as barras — pintar cada barra de um tom diferente conforme o tamanho
 * duplicaria em cor a informacao que a altura ja da.
 *
 * O alvo de hover e a faixa inteira da barra, nao a barra: uma coluna baixa
 * teria poucos pixels de altura clicavel.
 */
export function BarChart({
  dados,
  cor = 'var(--chart-1)',
  formatarValor = (valor) => String(valor),
  formatarTick = (valor) => String(valor),
}) {
  const [ref, largura] = useLarguraElemento()
  const [indiceAtivo, setIndiceAtivo] = useState(null)

  const alturaTotal = ALTURA_PLOT + PAD.topo + PAD.baixo
  const larguraPlot = Math.max(0, largura - PAD.esquerda - PAD.direita)
  const base = PAD.topo + ALTURA_PLOT

  const { max: topo, passo } = escalaLimpa(Math.max(...dados.map((d) => d.valor), 0))

  const faixa = dados.length > 0 ? larguraPlot / dados.length : 0
  const espessura = Math.min(ESPESSURA_MAX_BARRA, Math.max(6, faixa * 0.5))

  const posXFaixa = (indice) => PAD.esquerda + indice * faixa
  const posXBarra = (indice) => posXFaixa(indice) + (faixa - espessura) / 2
  const alturaBarra = (valor) => (valor / topo) * ALTURA_PLOT

  const indiceMaximo = dados.reduce(
    (melhor, ponto, indice) => (ponto.valor > dados[melhor].valor ? indice : melhor),
    0,
  )
  const pontoAtivo = indiceAtivo === null ? null : dados[indiceAtivo]

  return (
    <div ref={ref} className="relative w-full min-w-0">
      {largura > 0 && (
        <svg
          width={largura}
          height={alturaTotal}
          role="img"
          aria-label={`Gráfico de barras. ${dados.map((d) => `${d.label}: ${formatarValor(d.valor)}`).join('. ')}`}
          className="block"
          onMouseLeave={() => setIndiceAtivo(null)}
        >
          {listaDeTicks(topo, passo).map((valor) => (
            <g key={valor}>
              <line
                x1={PAD.esquerda}
                x2={largura - PAD.direita}
                y1={base - alturaBarra(valor)}
                y2={base - alturaBarra(valor)}
                stroke="var(--chart-grid)"
                strokeWidth={1}
              />
              <text
                x={PAD.esquerda - 8}
                y={base - alturaBarra(valor) + 3}
                textAnchor="end"
                className="fill-[var(--text-tertiary)] text-[10px] [font-variant-numeric:tabular-nums]"
              >
                {formatarTick(valor)}
              </text>
            </g>
          ))}

          {dados.map((ponto, indice) => {
            const altura = alturaBarra(ponto.valor)
            const ativo = indiceAtivo === indice
            return (
              <g key={ponto.label}>
                <path
                  d={caminhoBarra(posXBarra(indice), base - altura, espessura, altura)}
                  fill={cor}
                  opacity={indiceAtivo === null || ativo ? 1 : 0.55}
                />
                <text
                  x={posXFaixa(indice) + faixa / 2}
                  y={alturaTotal - 8}
                  textAnchor="middle"
                  className="fill-[var(--text-tertiary)] text-[10px]"
                >
                  {ponto.label}
                </text>
                {/* Rotulo direto so no extremo — um numero em cima de toda
                    barra vira ruido e ninguem le. */}
                {indice === indiceMaximo && ponto.valor > 0 && (
                  <text
                    x={posXFaixa(indice) + faixa / 2}
                    y={Math.max(base - altura - 7, PAD.topo)}
                    textAnchor="middle"
                    className="fill-[var(--text-primary)] text-[10px] font-semibold [font-variant-numeric:tabular-nums]"
                  >
                    {formatarValor(ponto.valor)}
                  </text>
                )}
                <rect
                  x={posXFaixa(indice)}
                  y={PAD.topo}
                  width={faixa}
                  height={ALTURA_PLOT}
                  fill="transparent"
                  onMouseEnter={() => setIndiceAtivo(indice)}
                />
              </g>
            )
          })}
        </svg>
      )}

      {pontoAtivo && (
        <ChartTooltip
          x={posXFaixa(indiceAtivo) + faixa / 2}
          y={base - alturaBarra(pontoAtivo.valor)}
          largura={largura}
          titulo={pontoAtivo.label}
          valor={formatarValor(pontoAtivo.valor)}
        />
      )}
    </div>
  )
}
