import { NavTabs } from './NavTabs'
import { Sidebar } from './Sidebar'
import { PerfilUsuario } from './PerfilUsuario'
import { Logo } from '../ui/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'

/**
 * Estrutura de pagina mobile-first. No mobile, cabecalho + tira de abas
 * horizontal (NavTabs). Em sm+, um menu lateral fixo (Sidebar) substitui as
 * abas — nenhuma tela depende do sidebar para funcionar, ele so aparece
 * como camada de conforto adicional (ver CLAUDE.md).
 */
export function AppShell({ children }) {
  return (
    <div className="min-h-screen text-[var(--text-primary)] sm:flex">
      <aside className="hidden sm:sticky sm:top-0 sm:flex sm:h-screen sm:w-64 sm:shrink-0 sm:flex-col sm:gap-5 sm:p-4">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <Logo size={26} />
          Meu Gerente
        </span>

        <PerfilUsuario />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar />
        </div>

        <ThemeToggle className="self-start" />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sm:hidden">
          <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-3">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <Logo size={26} />
              Meu Gerente
            </span>
            <ThemeToggle />
          </div>
          <div className="px-4 pb-3">
            <PerfilUsuario />
          </div>
          <NavTabs />
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  )
}
