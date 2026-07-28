import { useState } from 'react'
import { Button } from '../../ui/Button'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { STATUS, STATUS_META, FORMATO, FORMATO_META } from './constants'

const FORMATO_OPCOES = Object.entries(FORMATO_META).map(([value, label]) => ({ value, label }))
const STATUS_OPCOES = Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))

const SELECT_CLASSES =
  'rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]'

export function NovoGanchoForm({ subcategorias, onAdicionar }) {
  const [texto, setTexto] = useState('')
  const [formato, setFormato] = useState(FORMATO.FALADO)
  const [status, setStatus] = useState(STATUS.PARA_TESTAR)
  const [subcategoriaId, setSubcategoriaId] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!texto.trim()) return
    onAdicionar({ texto: texto.trim(), formato, status, subcategoriaId: subcategoriaId || null })
    setTexto('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Texto ou roteiro do gancho"
        rows={2}
        className={`${SELECT_CLASSES} resize-none placeholder:text-[var(--text-tertiary)]`}
      />
      <SegmentedControl options={FORMATO_OPCOES} value={formato} onChange={setFormato} />
      <SegmentedControl options={STATUS_OPCOES} value={status} onChange={setStatus} />
      {subcategorias.length > 0 && (
        <select
          value={subcategoriaId}
          onChange={(evento) => setSubcategoriaId(evento.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Sem categoria</option>
          {subcategorias.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.nome}</option>
          ))}
        </select>
      )}
      <Button type="submit" variant="primary" className="self-start">
        Adicionar gancho
      </Button>
    </form>
  )
}
