import { useEffect } from 'react'
import { Card } from './Card'

/**
 * Pop-up modal simples: overlay escuro + card centralizado. Ver
 * designsystem.md secao 2.7 (elevation.3 / surface.modal).
 */
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(evento) {
      if (evento.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm shadow-[var(--shadow-elevation-3)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-xl leading-none text-[var(--text-tertiary)]"
          >
            ×
          </button>
        </div>
        {children}
      </Card>
    </div>
  )
}
