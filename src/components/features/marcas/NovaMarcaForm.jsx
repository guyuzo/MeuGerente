import { useState } from 'react'
import { Button } from '../../ui/Button'

// Cadastro de marca dentro de uma categoria: nome + quais subcategorias
// daquela categoria ela pertence (N:N, ver prd.md secao 6.3).
export function NovaMarcaForm({ subcategorias, onAdicionar }) {
  const [nome, setNome] = useState('')
  const [selecionadas, setSelecionadas] = useState([])

  function alternarSubcategoria(id) {
    setSelecionadas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    )
  }

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim()) return
    onAdicionar({ nome: nome.trim(), subcategoriaIds: selecionadas })
    setNome('')
    setSelecionadas([])
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Nome da marca"
        className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]"
      />
      {subcategorias.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {subcategorias.map((sub) => {
            const ativa = selecionadas.includes(sub.id)
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => alternarSubcategoria(sub.id)}
                className={`rounded-full px-3 py-1 text-xs ${
                  ativa
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]'
                }`}
              >
                {sub.nome}
              </button>
            )
          })}
        </div>
      )}
      <Button type="submit" variant="secondary" size="sm" className="self-start">
        + Marca
      </Button>
    </form>
  )
}
