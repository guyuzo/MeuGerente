import { useState } from 'react'
import { Button } from '../../ui/Button'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]'

export function NovoProdutoForm({ subcategorias, onAdicionar }) {
  const [nome, setNome] = useState('')
  const [subcategoriaId, setSubcategoriaId] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim()) return
    onAdicionar({ nome: nome.trim(), subcategoriaId: subcategoriaId || null })
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Nome do produto"
        className={`flex-1 ${INPUT_CLASSES}`}
      />
      <select
        value={subcategoriaId}
        onChange={(evento) => setSubcategoriaId(evento.target.value)}
        className={INPUT_CLASSES}
      >
        <option value="">Sem categoria</option>
        {subcategorias.map((sub) => (
          <option key={sub.id} value={sub.id}>{sub.nome}</option>
        ))}
      </select>
      <Button type="submit" variant="primary">
        + Produto
      </Button>
    </form>
  )
}
