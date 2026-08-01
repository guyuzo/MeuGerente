import { useEffect, useState } from 'react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'

// Le o status via backend (server/) — as chaves do TikTok nunca ficam no
// client, so o servidor sabe se estao configuradas (ver server/index.js).
export function IntegracaoTikTok() {
  const [status, setStatus] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [desconectando, setDesconectando] = useState(false)

  function desconectar() {
    setDesconectando(true)
    fetch('/api/tiktok/desconectar', { method: 'POST' })
      .then(() => setStatus((atual) => ({ ...atual, conectado: false, perfil: null })))
      .finally(() => setDesconectando(false))
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resultado = params.get('tiktok')
    if (resultado === 'conectado') setMensagem('TikTok conectado com sucesso!')
    if (resultado === 'erro') setMensagem('Não foi possível conectar ao TikTok. Tente novamente.')
    if (resultado) {
      params.delete('tiktok')
      const query = params.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
    }

    fetch('/api/tiktok/status')
      .then((resposta) => resposta.json())
      .then(setStatus)
      .catch(() => setStatus({ configurado: false, conectado: false }))
  }, [])

  if (!status) return null

  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {status.conectado && status.perfil?.avatar_url && (
          <img
            src={status.perfil.avatar_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-semibold">
            {status.conectado && status.perfil?.display_name
              ? status.perfil.display_name
              : 'Integração com TikTok'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {!status.configurado
              ? 'Aguardando credenciais do TikTok (ver server/.env.example).'
              : status.conectado
                ? 'Conectado — métricas do TikTok Shop entram assim que a API estiver liberada.'
                : 'Ainda não conectado.'}
          </p>
          {mensagem && <p className="mt-1 text-xs text-[var(--accent-secondary)]">{mensagem}</p>}
        </div>
      </div>
      {status.configurado && !status.conectado && (
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => {
            window.location.href = '/auth/tiktok'
          }}
        >
          Conectar com TikTok
        </Button>
      )}
      {status.configurado && status.conectado && (
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={desconectar}
          disabled={desconectando}
        >
          Desconectar
        </Button>
      )}
    </Card>
  )
}
