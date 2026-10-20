import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  /** "larga" abre até 1024px no desktop — pra fluxos com lista + prévia lado a lado. */
  largura?: "padrao" | "larga";
}

/** Modal base — usado pelo form de produto e pelo aviso de prazo de amostra. Full-screen no mobile, centralizado a partir de sm. */
export function Modal({ aberto, titulo, onFechar, children, largura = "padrao" }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onFechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          "relative w-full max-h-[90vh] overflow-y-auto scroll-fino bg-neutral-50 rounded-t-xl sm:rounded-xl p-6",
          largura === "larga" ? "sm:max-w-2xl lg:max-w-5xl" : "sm:max-w-lg lg:max-w-xl",
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 text-neutral-900">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
