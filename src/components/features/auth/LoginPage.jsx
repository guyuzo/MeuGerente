import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Logo } from '../../ui/Logo'
import { useAuth } from './AuthProvider'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]'

export function LoginPage() {
  const { configurado, entrar, cadastrar, continuarSemLogin } = useAuth()
  const [modo, setModo] = useState('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await entrar({ email, senha })
      } else {
        await cadastrar({ nome, email, senha })
      }
    } catch (excecao) {
      setErro(excecao.message || 'Não foi possível continuar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4 py-10">
      <Card className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size={40} />
          <h1 className="text-xl font-semibold">Meu Gerente</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {modo === 'entrar' ? 'Entre para ver sua pauta de hoje.' : 'Crie sua conta para começar.'}
          </p>
        </div>

        {!configurado ? (
          <p className="rounded-[var(--radius-sm)] border border-[var(--accent-warning)] p-3 text-sm text-[var(--text-secondary)]">
            Login ainda não configurado: crie um projeto no Supabase e preencha{' '}
            <code className="text-xs">.env</code> com <code className="text-xs">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> (veja <code className="text-xs">.env.example</code>).
          </p>
        ) : null}

        {!configurado && (
          <Button type="button" variant="secondary" className="justify-center" onClick={continuarSemLogin}>
            Continuar sem login (modo dev)
          </Button>
        )}

        {configurado && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {modo === 'cadastrar' && (
              <input
                type="text"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                placeholder="Seu nome"
                required
                className={INPUT_CLASSES}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="E-mail"
              required
              className={INPUT_CLASSES}
            />
            <input
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className={INPUT_CLASSES}
            />

            {erro && <p className="text-xs text-[var(--accent-critical)]">{erro}</p>}

            <Button type="submit" variant="primary" className="mt-1 justify-center" disabled={enviando}>
              {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
        )}

        {configurado && (
          <button
            type="button"
            onClick={() => setModo((atual) => (atual === 'entrar' ? 'cadastrar' : 'entrar'))}
            className="text-center text-xs text-[var(--text-secondary)]"
          >
            {modo === 'entrar' ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
          </button>
        )}
      </Card>
    </div>
  )
}
