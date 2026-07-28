import {
  isAtrasado,
  adicionarDias,
  inicioDaSemana,
  formatarDiaCurto,
  formatarIntervalo,
  formatarDataLonga,
} from './utils'

// Visao de agenda (dia / 3 dias / semana): mesmo vocabulario visual da
// grade mensal (CalendarioMensal), mas em colunas maiores — sem hora, ja
// que ConteudoCalendario nao tem granularidade de horario (prd.md secao 10).
export function CalendarioAgenda({ itens, hojeISO, diaSelecionado, onSelecionarDia, dataAncora, onMudarAncora, dias }) {
  const inicio = dias === 7 ? inicioDaSemana(dataAncora) : dataAncora
  const colunas = Array.from({ length: dias }, (_, indice) => adicionarDias(inicio, indice))
  const fim = colunas[colunas.length - 1]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMudarAncora(adicionarDias(dataAncora, -dias))}
          className="px-3 py-1 text-xl text-[var(--text-secondary)]"
          aria-label="Período anterior"
        >
          ‹
        </button>
        <span className="text-lg font-semibold">
          {dias === 1 ? formatarDataLonga(inicio) : formatarIntervalo(inicio, fim)}
        </span>
        <button
          type="button"
          onClick={() => onMudarAncora(adicionarDias(dataAncora, dias))}
          className="px-3 py-1 text-xl text-[var(--text-secondary)]"
          aria-label="Próximo período"
        >
          ›
        </button>
      </div>

      <div className={`grid gap-1.5 ${dias === 1 ? 'grid-cols-1' : dias === 3 ? 'grid-cols-3' : 'grid-cols-7'}`}>
        {colunas.map((iso) => {
          const { diaSemana, dia } = formatarDiaCurto(iso)
          const itensDoDia = itens.filter((item) => item.data === iso)
          const selecionado = iso === diaSelecionado
          const ehHoje = iso === hojeISO

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelecionarDia(iso)}
              className={`flex min-h-32 flex-col items-start gap-1 rounded-[var(--radius-sm)] p-2 text-left ${
                selecionado
                  ? 'bg-[var(--accent-primary)] text-white'
                  : ehHoje
                    ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              <span className="text-xs font-medium tracking-wide uppercase opacity-80">{diaSemana}</span>
              <span className="text-lg font-semibold">{dia}</span>

              <div className="flex w-full flex-col gap-1">
                {itensDoDia.map((item) => (
                  <span
                    key={item.id}
                    className={`w-full truncate rounded-[var(--radius-xs)] px-1.5 py-1 text-xs leading-tight ${
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
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
