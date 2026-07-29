import { NavLink } from 'react-router-dom'
import { GRUPOS_NAV } from './navConfig'

/**
 * Tira horizontal com scroll no mobile. Em sm+ a navegacao vira Sidebar
 * lateral (ver AppShell) — isso aqui fica exclusivo do mobile.
 *
 * As abas seguem o padrao da referencia: pills soltas sobre o canvas (sem
 * trilho), ativa em preenchimento invertido solido. Os grupos do navConfig
 * viram separadores finos, para a tira nao virar uma fileira unica e
 * embaralhada de sete itens.
 */
export function NavTabs() {
  return (
    <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3">
      {GRUPOS_NAV.map((grupo, indice) => (
        <div key={grupo.label ?? `grupo-${indice}`} className="flex shrink-0 items-center gap-1.5">
          {indice > 0 && (
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[var(--border-default)]" />
          )}
          {grupo.itens.map((rota) => (
            <NavLink
              key={rota.to}
              to={rota.to}
              end={rota.end}
              title={grupo.label ? `${grupo.label}: ${rota.label}` : rota.label}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-surface-inverse)] text-[var(--text-inverse)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`
              }
            >
              <rota.Icon size={15} strokeWidth={1.75} aria-hidden="true" />
              {rota.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
