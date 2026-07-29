import { useState } from 'react'

const TAMANHO = 168
const ESPESSURA = 22
const VAO = 2 // vao em pixels de superficie entre fatias vizinhas

/**
 * Parte-do-todo em relance. Limitado a poucas fatias de proposito — donut
 * nao serve para comparar valores proximos, so para mostrar a divisao.
 *
 * As fatias sao separadas por um vao de 2px na cor da superficie, nunca por
 * contorno: contorno adiciona tinta que nao e dado.
 */
export function DonutChart({ dados, rotuloCentro, valorCentro }) {
  const [ativa, setAtiva] = useState(null)

  const total = dados.reduce((soma, fatia) => soma + fatia.valor, 0)
  const raio = (TAMANHO - ESPESSURA) / 2
  const circunferencia = 2 * Math.PI * raio
  const centro = TAMANHO / 2

  let acumulado = 0
  const fatias = dados.map((fatia) => {
    const comprimento = total > 0 ? (fatia.valor / total) * circunferencia : 0
    const inicio = acumulado
    acumulado += comprimento
    return { ...fatia, comprimento, inicio }
  })

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: TAMANHO, height: TAMANHO }}>
        <svg
          width={TAMANHO}
          height={TAMANHO}
          role="img"
          aria-label={`Gráfico de rosca. ${dados.map((f) => `${f.label}: ${f.valor}`).join('. ')}`}
        >
          <g transform={`rotate(-90 ${centro} ${centro})`}>
            {total === 0 ? (
              <circle
                cx={centro}
                cy={centro}
                r={raio}
                fill="none"
                stroke="var(--chart-grid)"
                strokeWidth={ESPESSURA}
              />
            ) : (
              fatias.map((fatia) => {
                if (fatia.comprimento <= 0) return null
                const visivel = Math.max(0, fatia.comprimento - VAO)
                return (
                  <circle
                    key={fatia.label}
                    cx={centro}
                    cy={centro}
                    r={raio}
                    fill="none"
                    stroke={fatia.cor}
                    strokeWidth={ESPESSURA}
                    strokeDasharray={`${visivel} ${circunferencia - visivel}`}
                    strokeDashoffset={-fatia.inicio}
                    opacity={ativa === null || ativa === fatia.label ? 1 : 0.5}
                    onMouseEnter={() => setAtiva(fatia.label)}
                    onMouseLeave={() => setAtiva(null)}
                  />
                )
              })
            )}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight">{valorCentro}</span>
          <span className="text-[11px] text-[var(--text-secondary)]">{rotuloCentro}</span>
        </div>
      </div>

      {/* Legenda sempre presente: a identidade nunca pode depender so da cor.
          O texto veste tokens de texto — quem carrega a cor e o marcador. */}
      <ul className="flex w-full min-w-0 flex-col gap-1.5">
        {dados.map((fatia) => (
          <li
            key={fatia.label}
            className="flex items-center gap-2 text-sm"
            onMouseEnter={() => setAtiva(fatia.label)}
            onMouseLeave={() => setAtiva(null)}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: fatia.cor }}
            />
            <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">
              {fatia.label}
            </span>
            <span className="shrink-0 font-semibold [font-variant-numeric:tabular-nums]">
              {fatia.valor}
            </span>
            <span className="w-10 shrink-0 text-right text-xs text-[var(--text-tertiary)] [font-variant-numeric:tabular-nums]">
              {total > 0 ? `${Math.round((fatia.valor / total) * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
