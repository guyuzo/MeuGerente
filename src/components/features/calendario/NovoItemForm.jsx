import { useState } from 'react'
import { Button } from '../../ui/Button'

const INPUT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]'

// Criacao rapida: so data + o que gravar, conforme prd.md secao 6.1.
// Amostra e opcional — vincula o item ao produto fisico que sera usado.
export function NovoItemForm({ hojeISO, amostras = [], onAdicionar }) {
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(hojeISO)
  const [amostraId, setAmostraId] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!titulo.trim()) return
    onAdicionar({ titulo: titulo.trim(), data, amostraId: amostraId || null })
    setTitulo('')
    setData(hojeISO)
    setAmostraId('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input
        type="text"
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
        placeholder="O que gravar?"
        className={`flex-1 placeholder:text-[var(--text-tertiary)] ${INPUT_CLASSES}`}
      />
      <input
        type="date"
        value={data}
        onChange={(evento) => setData(evento.target.value)}
        className={INPUT_CLASSES}
      />
      {amostras.length > 0 && (
        <select
          value={amostraId}
          onChange={(evento) => setAmostraId(evento.target.value)}
          className={INPUT_CLASSES}
        >
          <option value="">Sem amostra</option>
          {amostras.map((amostra) => (
            <option key={amostra.id} value={amostra.id}>{amostra.nome}</option>
          ))}
        </select>
      )}
      <Button type="submit" variant="primary">
        Adicionar
      </Button>
    </form>
  )
}
