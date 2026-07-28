import { useState } from 'react'
import { Button } from '../../ui/Button'
import { ICONES_CATEGORIA, ICONES_SUGERIDOS, sugerirIconeCategoria } from '../../../lib/iconesCategorias'

// Categoria = nome + icone. O icone e sugerido automaticamente pelo nome
// digitado (pedido do usuario); escolher manualmente um dos presets trava
// a sugestao automatica pra nao sobrescrever a escolha da pessoa.
export function NovaCategoriaForm({ onAdicionar }) {
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState(ICONES_SUGERIDOS[0])
  const [iconeManual, setIconeManual] = useState(false)

  function handleNomeChange(valor) {
    setNome(valor)
    if (!iconeManual) {
      const sugestao = sugerirIconeCategoria(valor)
      if (sugestao) setIcone(sugestao)
    }
  }

  function handleEscolherIcone(nomeIcone) {
    setIconeManual(true)
    setIcone(nomeIcone)
  }

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim()) return
    onAdicionar(nome.trim(), icone)
    setNome('')
    setIcone(ICONES_SUGERIDOS[0])
    setIconeManual(false)
  }

  const IconeAtual = ICONES_CATEGORIA[icone] ?? ICONES_CATEGORIA.Tag

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex gap-2">
          <span className="flex w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
            <IconeAtual size={20} strokeWidth={1.75} />
          </span>
          <input
            type="text"
            value={nome}
            onChange={(evento) => handleNomeChange(evento.target.value)}
            placeholder="Nova categoria (ex: Moda Feminina)"
            className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <Button type="submit" variant="primary" size="sm" className="shrink-0 sm:self-stretch">
          + Categoria
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {ICONES_SUGERIDOS.map((nomeIcone) => {
          const Icone = ICONES_CATEGORIA[nomeIcone]
          const ativo = icone === nomeIcone
          return (
            <button
              key={nomeIcone}
              type="button"
              onClick={() => handleEscolherIcone(nomeIcone)}
              aria-label={nomeIcone}
              className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-xs)] ${
                ativo
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
              }`}
            >
              <Icone size={16} strokeWidth={1.75} />
            </button>
          )
        })}
      </div>
    </form>
  )
}
