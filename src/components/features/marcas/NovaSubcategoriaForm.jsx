import { useState } from 'react'
import { Button } from '../../ui/Button'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]'

export function NovaSubcategoriaForm({ categorias, onAdicionar }) {
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? '')
  const [nome, setNome] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!nome.trim() || !categoriaId) return
    onAdicionar(categoriaId, nome.trim())
    setNome('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {categorias.length > 1 && (
        <select value={categoriaId} onChange={(evento) => setCategoriaId(evento.target.value)} className={INPUT_CLASSES}>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.emoji} {categoria.nome}
            </option>
          ))}
        </select>
      )}
      <input
        type="text"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        placeholder="Nome da subcategoria (ex: Blusas)"
        className={INPUT_CLASSES}
      />
      <Button type="submit" variant="primary" className="justify-center">
        + Subcategoria
      </Button>
    </form>
  )
}
