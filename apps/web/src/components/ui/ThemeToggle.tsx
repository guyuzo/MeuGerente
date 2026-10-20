import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Tema = "light" | "dark";
const CHAVE_STORAGE = "meugerente-theme";

function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo === "dark" || salvo === "light") return salvo;
  } catch {
    // localStorage indisponível (modo privado etc.) — cai no padrão claro.
  }
  return "light";
}

/** Alternador claro/escuro manual — aplica `data-theme` em <html> e persiste a escolha no navegador. */
export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem(CHAVE_STORAGE, tema);
    } catch {
      // ignora falha de storage — o tema ainda funciona só na sessão atual.
    }
  }, [tema]);

  return (
    <button
      type="button"
      onClick={() => setTema((t) => (t === "light" ? "dark" : "light"))}
      aria-label={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      className="flex items-center gap-3 h-11 px-3 w-full rounded-md text-body-strong font-medium text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900"
    >
      {tema === "light" ? <Moon size={18} /> : <Sun size={18} />}
      {tema === "light" ? "Modo escuro" : "Modo claro"}
    </button>
  );
}
