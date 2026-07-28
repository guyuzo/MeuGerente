import { NavLink } from 'react-router-dom'
import { GRUPOS_NAV } from './navConfig'

/**
 * Menu lateral (sm+): grupos com rotulo em caixa alta (type.eyebrow, ver
 * designsystem.md 3.3) e item ativo em pill lavanda (color.purple.100/700),
 * mesmo em dark mode — igual ao padrao de referencia do usuario.
 */
export function Sidebar() {
  return (
    <nav className="flex flex-col gap-4">
      {GRUPOS_NAV.map((grupo, indice) => (
        <div key={grupo.label ?? `grupo-${indice}`} className="flex flex-col gap-0.5">
          {grupo.label && (
            <span className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-[var(--text-tertiary)] uppercase">
              {grupo.label}
            </span>
          )}
          {grupo.itens.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-[var(--color-purple-100)] text-[var(--color-purple-700)]'
                    : 'text-[var(--text-secondary)]'
                }`
              }
            >
              <item.Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
