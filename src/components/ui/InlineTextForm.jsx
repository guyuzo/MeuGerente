import { useState } from 'react'

/**
 * Form minimo de "texto + adicionar", reaproveitado em qualquer lugar do
 * sistema que precise de criacao rapida por nome (categoria, subcategoria...).
 */
export function InlineTextForm({ placeholder, buttonLabel = 'Adicionar', onSubmit, className = '' }) {
  const [valor, setValor] = useState('')

  function handleSubmit(evento) {
    evento.preventDefault()
    if (!valor.trim()) return
    onSubmit(valor.trim())
    setValor('')
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white"
      >
        {buttonLabel}
      </button>
    </form>
  )
}
