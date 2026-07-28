import { Modal } from './Modal'
import { Button } from './Button'

/**
 * Confirmacao antes de uma acao destrutiva (pedido do usuario: evitar
 * remover algo por clique acidental num botao de icone).
 */
export function ConfirmModal({ open, title = 'Remover?', mensagem, onConfirmar, onCancelar }) {
  return (
    <Modal open={open} onClose={onCancelar} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-secondary)]">{mensagem}</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="critical" className="flex-1 justify-center" onClick={onConfirmar}>
            Remover
          </Button>
        </div>
      </div>
    </Modal>
  )
}
