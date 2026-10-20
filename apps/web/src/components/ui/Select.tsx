import { ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  type OptionHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

interface SelectProps {
  id?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  children: ReactNode;
}

interface Opcao {
  value: string;
  label: string;
}

/** Achata filhos JSX em texto puro — `String(array)` juntaria com vírgula, então não dá pra usar direto. */
function paraTexto(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(paraTexto).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return paraTexto(node.props.children);
  return "";
}

function extrairOpcoes(children: ReactNode): Opcao[] {
  const opcoes: Opcao[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child) && child.type === "option") {
      opcoes.push({ value: String(child.props.value ?? ""), label: paraTexto(child.props.children) });
    }
  });
  return opcoes;
}

interface PosicaoDropdown {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  paraCima: boolean;
}

const MARGEM_VIEWPORT = 12;
const ALTURA_MAXIMA_PADRAO = 320;

function calcularPosicao(gatilho: HTMLElement): PosicaoDropdown {
  const rect = gatilho.getBoundingClientRect();
  const espacoAbaixo = window.innerHeight - rect.bottom - MARGEM_VIEWPORT;
  const espacoAcima = rect.top - MARGEM_VIEWPORT;
  const paraCima = espacoAbaixo < 160 && espacoAcima > espacoAbaixo;

  return {
    top: paraCima ? rect.top : rect.bottom,
    left: rect.left,
    width: rect.width,
    maxHeight: Math.min(ALTURA_MAXIMA_PADRAO, Math.max(160, paraCima ? espacoAcima : espacoAbaixo)),
    paraCima,
  };
}

/** Dropdown com lista própria (não usa `<select>` nativo) pra não herdar o estilo do sistema operacional. */
export function Select({ id, value, onChange, className, placeholder = "Selecionar", children }: SelectProps) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState<PosicaoDropdown | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const opcoes = extrairOpcoes(children);
  const selecionada = opcoes.find((opcao) => opcao.value === value);

  useEffect(() => {
    if (!aberto) return;

    function reposicionar() {
      if (botaoRef.current) setPosicao(calcularPosicao(botaoRef.current));
    }
    reposicionar();

    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("resize", reposicionar);
    window.addEventListener("scroll", reposicionar, true);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("resize", reposicionar);
      window.removeEventListener("scroll", reposicionar, true);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={botaoRef}
        type="button"
        id={id}
        onClick={() => setAberto((a) => !a)}
        className="w-full h-10 px-3 rounded-md bg-neutral-150 text-body text-neutral-900 flex items-center justify-between gap-2 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 hover:bg-neutral-200"
      >
        <span className="truncate">{selecionada?.label || placeholder}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-neutral-600 transition-transform", aberto && "rotate-180")}
        />
      </button>

      {aberto &&
        posicao &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: posicao.left,
              width: posicao.width,
              maxHeight: posicao.maxHeight,
              ...(posicao.paraCima
                ? { bottom: window.innerHeight - posicao.top + 4 }
                : { top: posicao.top + 4 }),
            }}
            className="z-[60] overflow-y-auto rounded-md bg-neutral-50 border border-neutral-300 p-1 scroll-fino"
          >
            {opcoes.map((opcao) => (
              <button
                key={opcao.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opcao.value } });
                  setAberto(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded text-body truncate",
                  opcao.value === value ? "bg-neutral-900 text-neutral-50" : "text-neutral-900 hover:bg-neutral-150",
                )}
              >
                {opcao.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
