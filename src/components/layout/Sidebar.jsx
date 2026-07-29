import { NavLink } from 'react-router-dom'
import { GRUPOS_NAV } from './navConfig'

/**
 * Menu lateral (sm+): grupos com rotulo em caixa alta (type.eyebrow, ver
 * designsystem.md 3.3) e item ativo em pill de superficie.
 *
 * O ativo usa `bg.surface` + tinta primaria em vez de um acento saturado: a
 * referencia do usuario marca selecao por elevacao/contraste de superficie,
 * nao por cor cheia — e assim a pill funciona igual nos dois temas, ja que
 * canvas e surface se separam tanto no dark quanto no light.
 */
export function Sidebar() {
  return (
    <nav className="flex flex-col gap-5">
      {GRUPOS_NAV.map((grupo, indice) => (
        <div key={grupo.label ?? `grupo-${indice}`} className="flex flex-col gap-0.5">
          {grupo.label && (
            <span className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-[var(--text-tertiary)] uppercase">
              {grupo.label}
            </span>
          )}
          {grupo.itens.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-full px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-surface)] font-semibold text-[var(--text-primary)] shadow-[var(--shadow-elevation-1)]'
                    : 'font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
