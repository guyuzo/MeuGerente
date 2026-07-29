import { useMemo } from 'react'
import { Card } from '../../ui/Card'
import { StatCard } from '../../ui/StatCard'
import { ChartCard } from '../../ui/charts/ChartCard'
import { AreaChart } from '../../ui/charts/AreaChart'
import { BarChart } from '../../ui/charts/BarChart'
import { DonutChart } from '../../ui/charts/DonutChart'
import { useAuth } from '../auth/AuthProvider'
import { useCalendario } from '../calendario/useCalendario'
import { formatarDataCurta, todayISO, adicionarDias } from '../calendario/utils'
import { STATUS as STATUS_CALENDARIO } from '../calendario/constants'
import { useAmostras } from '../amostras/useAmostras'
import { STATUS as STATUS_AMOSTRA, STATUS_META as AMOSTRA_STATUS_META } from '../amostras/constants'
import { IntegracaoTikTok } from './IntegracaoTikTok'
import { GMV_MOCK, COMISSAO_MOCK, COMISSAO_MENSAL_MOCK, FRASES_MOTIVACIONAIS } from './constants'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const formatarBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const formatarBRLCurto = (valor) =>
  valor >= 1000 ? `${(valor / 1000).toFixed(1).replace('.', ',')}k` : String(valor)

const DIAS_NA_SERIE = 14

// Ordem das fatias fixada aqui, e nao derivada do objeto de status: a
// separacao entre as cores foi validada nesta sequencia (ver designsystem.md
// 3.6), entao reordenar exige revalidar a paleta.
const FATIAS_AMOSTRA = [
  { status: STATUS_AMOSTRA.RECEBIDA, cor: 'var(--chart-1)' },
  { status: STATUS_AMOSTRA.POSTADA, cor: 'var(--chart-2)' },
  { status: STATUS_AMOSTRA.VENDEU, cor: 'var(--chart-3)' },
  { status: STATUS_AMOSTRA.PARADA, cor: 'var(--chart-4)' },
]

export function DashboardPage() {
  const { nome } = useAuth()
  const { itens } = useCalendario()
  const { amostras } = useAmostras()

  const frase = useMemo(
    () => FRASES_MOTIVACIONAIS[Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length)],
    [],
  )

  const publicados = itens.filter((item) => item.status === STATUS_CALENDARIO.PUBLICADO)
  const ultimosPublicados = [...publicados]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)

  const hoje = new Date()
  const diaDoMes = hoje.getDate()
  const prefixoMesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const publicadosNoMes = publicados.filter((item) => item.data.startsWith(prefixoMesAtual)).length

  const mediaVideosPorDia = publicadosNoMes / diaDoMes
  const mediaGmvPorDia = GMV_MOCK / diaDoMes
  const mediaComissaoPorDia = COMISSAO_MOCK / diaDoMes
  const diasComPostagem = new Set(publicados.map((item) => item.data)).size

  // Serie diaria real: quantos videos foram publicados em cada um dos
  // ultimos 14 dias, incluindo hoje.
  const serieDiaria = useMemo(() => {
    const hojeISO = todayISO()
    const porData = publicados.reduce((mapa, item) => {
      mapa.set(item.data, (mapa.get(item.data) || 0) + 1)
      return mapa
    }, new Map())

    return Array.from({ length: DIAS_NA_SERIE }, (_, indice) => {
      const data = adicionarDias(hojeISO, indice - (DIAS_NA_SERIE - 1))
      return { label: formatarDataCurta(data), data, valor: porData.get(data) || 0 }
    })
  }, [publicados])

  const serieComissao = COMISSAO_MENSAL_MOCK.map((valor, indice) => {
    const referencia = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - (COMISSAO_MENSAL_MOCK.length - 1 - indice),
      1,
    )
    return { label: MESES_ABREV[referencia.getMonth()], valor }
  })

  const fatiasAmostras = FATIAS_AMOSTRA.map(({ status, cor }) => ({
    label: AMOSTRA_STATUS_META[status].label,
    valor: amostras.filter((amostra) => amostra.status === status).length,
    cor,
  }))

  const totalVideosNaSerie = serieDiaria.reduce((soma, dia) => soma + dia.valor, 0)

  return (
    <div className="flex flex-col gap-5">
      <Card className="!border-transparent !bg-[var(--accent-primary)] text-white">
        <p className="text-lg font-semibold">
          Olá, {nome || 'criador'}! Sou seu gerente, vamos iniciar 🚀
        </p>
        <p className="mt-1 text-sm opacity-90">{frase}</p>
      </Card>

      {/* Graficos antes dos numeros: sao eles que dao a leitura de "como
          estou indo", e os cards de metrica sozinhos empurravam tudo para
          baixo da dobra. A chamada de integracao com o TikTok fica logo
          depois dos dados de exemplo, onde ela faz sentido como resposta
          ("quer numeros reais? conecte aqui"). */}
      <ChartCard
        titulo="Ritmo de publicação"
        subtitulo={`${totalVideosNaSerie} vídeos publicados nos últimos ${DIAS_NA_SERIE} dias`}
        colunas={['Dia', 'Vídeos']}
        linhas={serieDiaria.map((dia) => [dia.label, dia.valor])}
      >
        <AreaChart
          dados={serieDiaria}
          cor="var(--chart-1)"
          inteiro
          formatarValor={(valor) => `${valor} vídeo${valor === 1 ? '' : 's'}`}
        />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          titulo="Comissão por mês"
          subtitulo="Dados de exemplo até a integração com o TikTok Shop"
          colunas={['Mês', 'Comissão']}
          linhas={serieComissao.map((mes) => [mes.label, formatarBRL(mes.valor)])}
        >
          <BarChart
            dados={serieComissao}
            cor="var(--chart-1)"
            formatarValor={formatarBRL}
            formatarTick={formatarBRLCurto}
          />
        </ChartCard>

        <ChartCard
          titulo="Amostras por status"
          subtitulo="Onde estão as amostras que você já recebeu"
          colunas={['Status', 'Amostras']}
          linhas={fatiasAmostras.map((fatia) => [fatia.label, fatia.valor])}
        >
          <DonutChart dados={fatiasAmostras} valorCentro={amostras.length} rotuloCentro="amostras" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Vídeos publicados" value={publicados.length} />
        <StatCard label="Amostras recebidas" value={amostras.length} />
        <StatCard label="Faturamento (GMV)" value={formatarBRL(GMV_MOCK)} legenda="dados de exemplo" />
        <StatCard label="Comissão" value={formatarBRL(COMISSAO_MOCK)} legenda="dados de exemplo" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Média de vídeos/dia" value={mediaVideosPorDia.toFixed(1)} legenda="neste mês" />
        <StatCard label="Média GMV/dia" value={formatarBRL(Math.round(mediaGmvPorDia))} legenda="dados de exemplo" />
        <StatCard label="Média comissão/dia" value={formatarBRL(Math.round(mediaComissaoPorDia))} legenda="dados de exemplo" />
        <StatCard
          label="Dias postando vídeos"
          value={diasComPostagem}
          legenda={diasComPostagem === 1 ? '1 dia no total' : `${diasComPostagem} dias no total`}
        />
      </div>

      <IntegracaoTikTok />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Últimos produtos postados</h2>
        {ultimosPublicados.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">
            Nenhum vídeo publicado ainda — assim que publicar pelo Calendário, aparece aqui.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {ultimosPublicados.map((item) => (
              <Card key={item.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">{item.titulo}</span>
                <span className="shrink-0 text-xs text-[var(--text-tertiary)]">
                  {formatarDataCurta(item.data)}
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
