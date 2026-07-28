import { useState } from 'react'
import { Button } from '../../ui/Button'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]'

export function NovaAmostraForm({ marcas, onAdicionar }) {
  const [nome, setNome] = useState('')
  const [marcaId, setMarcaId] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim()) return
    onAdicionar({ nome: nome.trim(), marcaId: marcaId || null })
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="O que é a amostra?"
        className={`flex-1 placeholder:text-[var(--text-tertiary)] ${INPUT_CLASSES}`}
      />
      <select value={marcaId} onChange={(evento) => setMarcaId(evento.target.value)} className={INPUT_CLASSES}>
        <option value="">Sem marca</option>
        {marcas.map((marca) => (
          <option key={marca.id} value={marca.id}>{marca.nome}</option>
        ))}
      </select>
      <Button type="submit" variant="primary">Adicionar</Button>
    </form>
  )
}
