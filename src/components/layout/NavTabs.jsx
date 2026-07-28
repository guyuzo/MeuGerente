import { NavLink } from 'react-router-dom'
import { GRUPOS_NAV } from './navConfig'

const ROTAS = GRUPOS_NAV.flatMap((grupo) => grupo.itens)

// Tira horizontal com scroll no mobile (padrao comum de tabs em app).
// Em sm+ a navegacao vira Sidebar lateral (ver AppShell) — isso aqui fica
// exclusivo do mobile.
export function NavTabs() {
  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
      {ROTAS.map((rota) => (
        <NavLink
          key={rota.to}
          to={rota.to}
          end={rota.end}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              isActive
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)]'
            }`
          }
        >
          <rota.Icon size={16} strokeWidth={1.75} aria-hidden="true" />
          {rota.label}
        </NavLink>
      ))}
    </nav>
  )
}
