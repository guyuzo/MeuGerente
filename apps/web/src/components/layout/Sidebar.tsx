import { LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "../shared";
import { useSair, useSessao } from "../../hooks/useSessao";
import { ThemeToggle } from "../ui/ThemeToggle";
import { cn } from "../../lib/utils";
import { NAV_ITEMS } from "./nav-items";

/** Conteúdo do menu, reaproveitado tanto na sidebar fixa (desktop) quanto na gaveta (mobile). */
export function Sidebar({ onNavegar }: { onNavegar?: () => void }) {
  const sessao = useSessao();
  const sair = useSair();

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      <div className="h-16 flex items-center px-6">
        <Logo className="h-7" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.emBreve ? "#" : item.path}
            onClick={(e) => {
              if (item.emBreve) e.preventDefault();
              onNavegar?.();
            }}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 h-11 px-3 rounded-md text-body-strong font-medium transition-colors",
                item.emBreve && "text-neutral-500 cursor-default",
                !item.emBreve &&
                  isActive &&
                  "bg-purple-50 text-neutral-900 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-purple-400",
                !item.emBreve && !isActive && "text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900",
              )
            }
            end={item.path === "/"}
          >
            <item.icon size={18} />
            {item.label}
            {item.emBreve && <span className="ml-auto text-micro text-neutral-500">em breve</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 mb-4 px-3 space-y-1">
        <ThemeToggle />
        <NavLink
          to="/conta"
          onClick={() => onNavegar?.()}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 h-11 px-3 w-full rounded-md text-body-strong font-medium",
              isActive ? "bg-purple-50 text-neutral-900" : "text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900",
            )
          }
        >
          <Settings size={18} />
          Configurações
        </NavLink>
        <button
          type="button"
          onClick={() => sair.mutate()}
          disabled={sair.isPending}
          className="flex items-center gap-3 h-11 px-3 w-full rounded-md text-body-strong font-medium text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900 disabled:opacity-50"
        >
          <LogOut size={18} />
          Sair
        </button>
        {sessao.data && (
          <p className="px-3 text-micro text-neutral-500 truncate" title={sessao.data.email}>
            {sessao.data.email}
          </p>
        )}
      </div>
    </div>
  );
}
