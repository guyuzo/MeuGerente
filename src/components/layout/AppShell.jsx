import { NavTabs } from './NavTabs'
import { Sidebar } from './Sidebar'
import { Logo } from '../ui/Logo'
import { useAuth } from '../features/auth/AuthProvider'

/**
 * Estrutura de pagina mobile-first. No mobile, cabecalho + tira de abas
 * horizontal (NavTabs). Em sm+, um menu lateral fixo (Sidebar) substitui as
 * abas — nenhuma tela depende do sidebar para funcionar, ele so aparece
 * como camada de conforto adicional (ver CLAUDE.md).
 */
export function AppShell({ children }) {
  const { sair } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] sm:flex">
      <aside className="hidden sm:flex sm:w-60 sm:shrink-0 sm:flex-col sm:border-r sm:border-[var(--border-default)] sm:p-4">
        <span className="flex items-center gap-2 pb-4 text-lg font-semibold">
          <Logo size={26} />
          Meu Gerente
        </span>
        <Sidebar />
        <button
          type="button"
          onClick={sair}
          className="mt-auto self-start px-3 py-2 text-xs text-[var(--text-secondary)]"
        >
          Sair
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-[var(--border-default)] pt-3 sm:hidden">
          <div className="flex items-center justify-between gap-2 px-4 pb-3">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <Logo size={26} />
              Meu Gerente
            </span>
            <button
              type="button"
              onClick={sair}
              className="text-xs text-[var(--text-secondary)]"
            >
              Sair
            </button>
          </div>
          <NavTabs />
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  )
}
