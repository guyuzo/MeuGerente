import { LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/AuthProvider'

/**
 * Bloco de identidade no topo do menu: avatar com inicial, nome e a saida da
 * conta logo abaixo — o padrao da referencia visual do usuario.
 *
 * O avatar usa o tint de acento fixo (purple.100/700, ver designsystem.md
 * secao 4), que ja carrega contraste proprio e por isso nao muda por tema.
 */
export function PerfilUsuario() {
  const { nome, sair } = useAuth()
  const rotulo = nome || 'criador'
  const inicial = rotulo.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-purple-100)] text-sm font-semibold text-[var(--color-purple-700)]"
      >
        {inicial}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{rotulo}</span>
        <button
          type="button"
          onClick={sair}
          className="flex items-center gap-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <LogOut size={12} strokeWidth={1.75} aria-hidden="true" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
