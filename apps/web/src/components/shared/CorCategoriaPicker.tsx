import type { CategoriaCor } from "@meugerente/shared";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Modal } from "../ui/Modal";
import { CORES_CATEGORIA, corCategoria } from "./categoria-cores";

interface CorCategoriaPickerProps {
  value: CategoriaCor;
  onChange: (cor: CategoriaCor) => void;
}

/** Bolinha de cor recolhida — a grade completa (mais opções) só aparece quando você clica pra editar. */
export function CorCategoriaPicker({ value, onChange }: CorCategoriaPickerProps) {
  const [aberto, setAberto] = useState(false);
  const atual = corCategoria(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        title="Escolher cor"
        aria-label="Escolher cor"
        className="w-8 h-8 rounded-full shrink-0 hover:ring-2 hover:ring-neutral-300"
      >
        <span className={cn("block w-full h-full rounded-full", atual.dot)} />
      </button>

      <Modal aberto={aberto} titulo="Escolher cor" onFechar={() => setAberto(false)}>
        <div className="grid grid-cols-6 gap-3">
          {CORES_CATEGORIA.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              title={opcao.label}
              aria-label={opcao.label}
              onClick={() => {
                onChange(opcao.value);
                setAberto(false);
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                value === opcao.value && "ring-2 ring-neutral-900 ring-offset-2",
              )}
            >
              <span className={cn("w-8 h-8 rounded-full", opcao.dot)} />
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
