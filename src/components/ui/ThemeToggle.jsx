import { Moon, Sun } from 'lucide-react'
import { useTema } from '../features/tema/ThemeProvider'

/**
 * Alterna claro/escuro. O rotulo descreve o destino da acao ("Ativar modo
 * claro"), nao o estado atual — é o que um leitor de tela precisa ouvir.
 */
export function ThemeToggle({ className = '' }) {
  const { tema, alternarTema } = useTema()
  const indoParaClaro = tema === 'dark'

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={indoParaClaro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={indoParaClaro ? 'Modo claro' : 'Modo escuro'}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] ${className}`}
    >
      {indoParaClaro ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
    </button>
  )
}
