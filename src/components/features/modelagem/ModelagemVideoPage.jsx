import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'

const CAMPOS_PREVISTOS = [
  'Gancho visual (o que aparece na tela nos primeiros segundos)',
  'Gancho escrito (texto sobreposto no vídeo)',
  'Gancho falado (transcrição da fala de abertura)',
  'Transcrição completa',
  'Sugestão de produto/categoria compatível',
]

// Modulo depende da Fase 3/4 do PRD (API de IA + backend para ler o vídeo).
// Sem credenciais/infra configuradas, o submit nao fabrica um resultado —
// so explica o que falta, honestamente.
export function ModelagemVideoPage() {
  const [url, setUrl] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!url.trim()) return
    setEnviado(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(evento) => setUrl(evento.target.value)}
            placeholder="Link do vídeo no TikTok"
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]"
          />
          <Button type="submit" variant="primary">Analisar vídeo</Button>
        </form>
      </Card>

      {enviado && (
        <Card className="!border-[var(--accent-warning)]">
          <p className="text-sm">
            Integração com IA ainda não configurada. Este módulo depende da Fase 3/4 do PRD
            (chave de API de Gemini/Claude + backend para ler o vídeo) — ver{' '}
            <code className="text-xs text-[var(--text-secondary)]">prd.md</code>, seção 6.5.
          </p>
        </Card>
      )}

      <Card>
        <h2 className="mb-2 text-sm font-semibold">O que essa tela vai trazer quando estiver integrada</h2>
        <ul className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
          {CAMPOS_PREVISTOS.map((campo) => (
            <li key={campo}>• {campo}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
