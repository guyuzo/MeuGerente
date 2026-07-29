import { useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { ConfirmModal } from '../../ui/ConfirmModal'
import { FORMATO, FORMATO_META } from '../ganchos/constants'

// Os tres ganchos do PRD, cada um amarrado ao formato que ele representa —
// e isso que permite "enviar para Ganchos" ja pre-preenchendo o formato
// (prd.md 6.5) em vez de pedir para o usuario escolher de novo.
const CAMPOS_GANCHO = [
  { chave: 'ganchoVisual', formato: FORMATO.VISUAL, rotulo: 'Gancho visual' },
  { chave: 'ganchoEscrito', formato: FORMATO.ESCRITO, rotulo: 'Gancho escrito' },
  { chave: 'ganchoFalado', formato: FORMATO.FALADO, rotulo: 'Gancho falado' },
]

function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function ModelagemCard({ modelagem, onEnviarParaGanchos, onRemover }) {
  const [enviados, setEnviados] = useState([])
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)

  function handleEnviar(campo) {
    onEnviarParaGanchos({ texto: modelagem[campo.chave], formato: campo.formato })
    setEnviados((atual) => [...atual, campo.chave])
  }

  const deArquivo = modelagem.origem === 'arquivo'
  const titulo = deArquivo
    ? modelagem.nomeArquivo
    : modelagem.metadados?.titulo || modelagem.url

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          {deArquivo ? (
            <span className="truncate text-sm font-semibold">{titulo}</span>
          ) : (
            <a
              href={modelagem.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm font-semibold hover:underline"
            >
              {titulo}
            </a>
          )}
          <span className="text-xs text-[var(--text-tertiary)]">
            {!deArquivo && modelagem.metadados?.autor ? `@${modelagem.metadados.autor} · ` : ''}
            {formatarData(modelagem.criadoEm)}
            {/* Deixa claro o quanto a analise pode ser confiada: video completo
                e observacao direta; capa e inferencia de um frame. */}
            {' · '}
            {modelagem.videoCompleto ? 'vídeo completo' : 'só capa e legenda'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmandoRemocao(true)}
          aria-label="Remover modelagem"
          className="shrink-0 text-[var(--text-tertiary)] transition-colors hover:text-[var(--accent-critical)]"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {CAMPOS_GANCHO.map((campo) => {
          const texto = modelagem[campo.chave]
          const jaEnviado = enviados.includes(campo.chave)

          return (
            <div
              key={campo.chave}
              className="flex flex-col gap-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{FORMATO_META[campo.formato]}</Badge>
                <span className="text-xs text-[var(--text-secondary)]">{campo.rotulo}</span>
              </div>

              {texto ? (
                <>
                  <p className="text-sm">{texto}</p>
                  {jaEnviado ? (
                    <span className="flex items-center gap-1 text-xs text-[var(--accent-success)]">
                      <Check size={13} strokeWidth={2} /> Enviado para Ganchos
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start"
                      onClick={() => handleEnviar(campo)}
                    >
                      Enviar para Ganchos
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Não foi possível identificar a partir dos dados disponíveis.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {modelagem.sugestaoCategoria && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-[var(--text-secondary)]">Categoria sugerida</span>
          <p className="text-sm">{modelagem.sugestaoCategoria}</p>
        </div>
      )}

      {modelagem.transcricao && (
        <details>
          <summary className="cursor-pointer text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
            Ver transcrição completa
          </summary>
          <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--text-secondary)]">
            {modelagem.transcricao}
          </p>
        </details>
      )}

      {modelagem.observacao && (
        <p className="border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
          {modelagem.observacao}
        </p>
      )}

      <ConfirmModal
        open={confirmandoRemocao}
        mensagem="Remover esta modelagem do histórico? Os ganchos já enviados continuam salvos."
        onConfirmar={() => {
          onRemover(modelagem.id)
          setConfirmandoRemocao(false)
        }}
        onCancelar={() => setConfirmandoRemocao(false)}
      />
    </Card>
  )
}
