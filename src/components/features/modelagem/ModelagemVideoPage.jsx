import { useEffect, useRef, useState } from 'react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { useModelagens } from './useModelagens'
import { ModelagemCard } from './ModelagemCard'
import { useGanchos } from '../ganchos/useGanchos'
import { STATUS as STATUS_GANCHO } from '../ganchos/constants'

const INPUT_CLASSES =
  'w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]'

const LIMITE_MB = 100

const ORIGENS = [
  { value: 'arquivo', label: 'Enviar vídeo' },
  { value: 'link', label: 'Colar link' },
]

export function ModelagemVideoPage() {
  const { modelagens, adicionar, remover } = useModelagens()
  const { adicionar: adicionarGancho } = useGanchos()
  const inputArquivo = useRef(null)

  // "arquivo" e o padrao de proposito: e o unico caminho que da transcricao
  // e analise dos frames. O link entrega so capa + legenda.
  const [origem, setOrigem] = useState('arquivo')
  const [url, setUrl] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [transcricaoManual, setTranscricaoManual] = useState('')
  const [mostrarTranscricao, setMostrarTranscricao] = useState(false)
  const [etapa, setEtapa] = useState('')
  const [erro, setErro] = useState('')
  const [configurado, setConfigurado] = useState(null)

  const analisando = Boolean(etapa)

  useEffect(() => {
    fetch('/api/modelagem/status')
      .then((resposta) => resposta.json())
      .then((dados) => setConfigurado(dados.configurado))
      .catch(() => setConfigurado(false))
  }, [])

  function limpar() {
    setUrl('')
    setArquivo(null)
    setTranscricaoManual('')
    setMostrarTranscricao(false)
    if (inputArquivo.current) inputArquivo.current.value = ''
  }

  function escolherArquivo(evento) {
    const escolhido = evento.target.files?.[0]
    setErro('')
    if (!escolhido) {
      setArquivo(null)
      return
    }
    if (escolhido.size > LIMITE_MB * 1024 * 1024) {
      setErro(`Esse vídeo tem ${(escolhido.size / 1024 / 1024).toFixed(0)} MB — o limite é ${LIMITE_MB} MB.`)
      setArquivo(null)
      evento.target.value = ''
      return
    }
    setArquivo(escolhido)
  }

  async function analisarArquivo() {
    setEtapa('Enviando vídeo…')
    const resposta = await fetch('/api/modelagem/analisar-arquivo', {
      method: 'POST',
      headers: {
        'Content-Type': arquivo.type || 'video/mp4',
        // Header cru nao aceita acento nem emoji — encode antes de mandar.
        'X-Nome-Arquivo': encodeURIComponent(arquivo.name),
        'X-Transcricao': encodeURIComponent(transcricaoManual),
      },
      body: arquivo,
    })
    setEtapa('Analisando áudio e imagem…')
    return resposta
  }

  async function analisarLink() {
    setEtapa('Analisando…')
    return fetch('/api/modelagem/analisar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), transcricaoManual }),
    })
  }

  async function handleSubmit(evento) {
    evento.preventDefault()
    if (analisando) return
    if (origem === 'arquivo' ? !arquivo : !url.trim()) return

    setErro('')
    try {
      const resposta = origem === 'arquivo' ? await analisarArquivo() : await analisarLink()
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível analisar o vídeo.')

      adicionar(dados)
      limpar()
    } catch (excecao) {
      setErro(excecao.message)
    } finally {
      setEtapa('')
    }
  }

  // Ganchos vindos da modelagem entram como "Para Testar": foram extraidos de
  // um video de referencia, nao validados no perfil do usuario.
  function enviarParaGanchos({ texto, formato }) {
    adicionarGancho({ texto, formato, status: STATUS_GANCHO.PARA_TESTAR })
  }

  const podeEnviar = origem === 'arquivo' ? Boolean(arquivo) : Boolean(url.trim())

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold">Modelagem de Vídeo</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Separe os ganchos de um vídeo para reaproveitar no seu conteúdo.
          </p>
        </div>

        <SegmentedControl options={ORIGENS} value={origem} onChange={setOrigem} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {origem === 'arquivo' ? (
            <div className="flex flex-col gap-2">
              <input
                ref={inputArquivo}
                type="file"
                accept="video/*"
                onChange={escolherArquivo}
                className="w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--bg-surface-raised)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--text-primary)]"
              />
              {arquivo && (
                <span className="text-xs text-[var(--text-secondary)]">
                  {arquivo.name} · {(arquivo.size / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          ) : (
            <input
              type="url"
              value={url}
              onChange={(evento) => setUrl(evento.target.value)}
              placeholder="https://www.tiktok.com/@perfil/video/..."
              className={INPUT_CLASSES}
            />
          )}

          {mostrarTranscricao ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text-secondary)]">
                Transcrição (opcional)
                {origem === 'link' && ' — sem ela a fala não pode ser identificada'}
              </span>
              <textarea
                value={transcricaoManual}
                onChange={(evento) => setTranscricaoManual(evento.target.value)}
                rows={5}
                placeholder="Cole aqui o que é falado no vídeo…"
                className={INPUT_CLASSES}
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarTranscricao(true)}
              className="self-start text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              + Colar transcrição (opcional)
            </button>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={analisando || !podeEnviar || configurado === false}
            className="justify-center"
          >
            {analisando ? etapa : 'Analisar vídeo'}
          </Button>
        </form>

        {erro && <p className="text-sm text-[var(--accent-critical)]">{erro}</p>}

        {configurado === false && (
          <p className="rounded-[var(--radius-sm)] border border-[var(--accent-warning)] p-3 text-sm text-[var(--text-secondary)]">
            IA ainda não configurada: preencha <code className="text-xs">GEMINI_API_KEY</code> em{' '}
            <code className="text-xs">server/.env</code> (a chave sai de aistudio.google.com/apikey)
            e reinicie o servidor.
          </p>
        )}

        {/* A diferenca entre os dois caminhos e grande o suficiente para ficar
            explicita na tela, nao escondida na documentacao. */}
        <p className="text-xs text-[var(--text-tertiary)]">
          {origem === 'arquivo'
            ? `Enviando o arquivo, a análise ouve o áudio e vê todos os frames — transcrição e os três ganchos saem completos. Até ${LIMITE_MB} MB.`
            : 'Pelo link, o TikTok só libera a legenda e a capa do vídeo — o arquivo em si não é público. A capa é analisada de verdade (gancho visual e texto na tela), mas o áudio fica de fora. Para transcrição, envie o arquivo.'}
        </p>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Vídeos modelados{modelagens.length > 0 && ` (${modelagens.length})`}
        </h2>

        {modelagens.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">
            Nenhum vídeo modelado ainda. Cada análise fica salva aqui para consultar depois.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {modelagens.map((modelagem) => (
              <ModelagemCard
                key={modelagem.id}
                modelagem={modelagem}
                onEnviarParaGanchos={enviarParaGanchos}
                onRemover={remover}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
