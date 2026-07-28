import { useMemo } from 'react'
import { Card } from '../../ui/Card'
import { StatCard } from '../../ui/StatCard'
import { Badge } from '../../ui/Badge'
import { useAuth } from '../auth/AuthProvider'
import { useCalendario } from '../calendario/useCalendario'
import { formatarDataCurta } from '../calendario/utils'
import { STATUS as STATUS_CALENDARIO } from '../calendario/constants'
import { useAmostras } from '../amostras/useAmostras'
import { STATUS_META as AMOSTRA_STATUS_META } from '../amostras/constants'
import { IntegracaoTikTok } from './IntegracaoTikTok'
import { GMV_MOCK, COMISSAO_MOCK, FRASES_MOTIVACIONAIS } from './constants'

const formatarBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

  return (
    <div className="flex flex-col gap-6">
      <Card className="!bg-[var(--accent-primary)] !border-transparent text-white">
        <p className="text-lg font-semibold">
          Olá, {nome || 'criador'}! Sou seu gerente, vamos iniciar 🚀
        </p>
        <p className="mt-1 text-sm opacity-90">{frase}</p>
      </Card>

      <IntegracaoTikTok />

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

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Amostras por status</h2>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(AMOSTRA_STATUS_META).map(([valor, meta]) => (
            <Badge key={valor} tone={meta.tone}>
              {meta.label} · {amostras.filter((a) => a.status === valor).length}
            </Badge>
          ))}
        </div>
      </section>

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
