import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Logo } from "../shared";
import { Sidebar } from "./Sidebar";

/**
 * Shell do app: sidebar fixa de 288px a partir de 1024px (PRD seção 10 / 12); abaixo disso vira gaveta.
 * Mobile-first: o markup nasce pensado para a gaveta, o `lg:` acrescenta o modo desktop por cima.
 */
export function AppShell() {
  const [drawerAberto, setDrawerAberto] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Barra superior mobile */}
      <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-neutral-50">
        <Logo className="h-6" />
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setDrawerAberto(true)}
          className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-150"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Gaveta mobile */}
      {drawerAberto && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerAberto(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw]">
            <div className="relative h-full">
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setDrawerAberto(false)}
                className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
              >
                <X size={18} />
              </button>
              <Sidebar onNavegar={() => setDrawerAberto(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar fixa desktop */}
      <aside className="hidden lg:block w-[288px] shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      <main className="flex-1 min-w-0 bg-neutral-300 min-h-screen">
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-12 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
