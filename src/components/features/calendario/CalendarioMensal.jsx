import { useMemo } from 'react'
import { isAtrasado } from './utils'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function paraISO(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

function ajustarMes({ ano, mes }, delta) {
  const data = new Date(ano, mes + delta, 1)
  return { ano: data.getFullYear(), mes: data.getMonth() }
}

// Visao mensal: entender de relance o que foi programado e o que nao foi
// (prd.md secao 6.1). Celulas maiores e com o conteudo do dia visivel
// (titulo do item + indicador de amostra), nao so um ponto de status.
// Cursor (mes/ano em foco) vem do pai — assim as visoes de dia/3 dias/
// semana/mes compartilham a mesma data-ancora ao trocar de aba.
export function CalendarioMensal({ itens, hojeISO, diaSelecionado, onSelecionarDia, cursor, onMudarCursor }) {
  const celulas = useMemo(() => {
    const primeiroDiaSemana = new Date(cursor.ano, cursor.mes, 1).getDay()
    const totalDias = new Date(cursor.ano, cursor.mes + 1, 0).getDate()
    const dias = Array(primeiroDiaSemana).fill(null)
    for (let dia = 1; dia <= totalDias; dia += 1) dias.push(dia)
    return dias
  }, [cursor])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMudarCursor(ajustarMes(cursor, -1))}
          className="px-3 py-1 text-xl text-[var(--text-secondary)]"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="text-lg font-semibold">
          {MESES[cursor.mes]} {cursor.ano}
        </span>
        <button
          type="button"
          onClick={() => onMudarCursor(ajustarMes(cursor, 1))}
          className="px-3 py-1 text-xl text-[var(--text-secondary)]"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium tracking-wide text-[var(--text-tertiary)] uppercase">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia}>{dia}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, indice) => {
          if (dia === null) return <div key={`vazio-${indice}`} />

          const iso = paraISO(cursor.ano, cursor.mes, dia)
          const itensDoDia = itens.filter((item) => item.data === iso)
          const temAtrasado = itensDoDia.some((item) => isAtrasado(item, hojeISO))
          const temAmostra = itensDoDia.some((item) => item.amostraId)
          const selecionado = iso === diaSelecionado
          const ehHoje = iso === hojeISO

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelecionarDia(iso)}
              className={`flex min-h-16 flex-col items-center gap-0.5 rounded-[var(--radius-sm)] p-1 pt-1.5 text-sm sm:min-h-24 sm:items-start sm:p-1.5 ${
                selecionado
                  ? 'bg-[var(--accent-primary)] text-white'
                  : ehHoje
                    ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              <span className="font-medium">{dia}</span>

              {itensDoDia.length > 0 && (
                <span
                  className={`h-1.5 w-1.5 rounded-full sm:hidden ${
                    temAtrasado ? 'bg-[var(--accent-critical)]' : 'bg-[var(--accent-secondary)]'
                  }`}
                />
              )}

              <div className="hidden w-full flex-col gap-0.5 sm:flex">
                {itensDoDia.slice(0, 2).map((item) => (
                  <span
                    key={item.id}
                    className={`w-full truncate rounded-[var(--radius-xs)] px-1 py-0.5 text-left text-[10px] leading-tight ${
                      selecionado
                        ? 'bg-white/20'
                        : isAtrasado(item, hojeISO)
                          ? 'bg-[var(--accent-critical)] text-[var(--text-inverse)]'
                          : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.amostraId && '📦 '}
                    {item.titulo}
                  </span>
                ))}
                {itensDoDia.length > 2 && (
                  <span className="text-left text-[10px] text-[var(--text-tertiary)]">
                    +{itensDoDia.length - 2}
                  </span>
                )}
              </div>

              {temAmostra && (
                <span className="text-xs sm:hidden" aria-label="Tem amostra vinculada">📦</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
