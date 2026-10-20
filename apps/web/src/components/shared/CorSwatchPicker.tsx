import type { BadgeTone } from "../ui/Badge";
import { cn } from "../../lib/utils";
import { CORES_TOM } from "./status-maps";

interface CorSwatchPickerProps {
  value: BadgeTone;
  onChange: (cor: BadgeTone) => void;
}

/** Fileira de bolinhas coloridas pra escolher tom — mostra a cor de verdade, não só o nome dela. */
export function CorSwatchPicker({ value, onChange }: CorSwatchPickerProps) {
  return (
    <div className="flex items-center gap-2">
      {CORES_TOM.map((opcao) => (
        <button
          key={opcao.value}
          type="button"
          title={opcao.label}
          aria-label={opcao.label}
          onClick={() => onChange(opcao.value)}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            value === opcao.value && "ring-2 ring-neutral-900 ring-offset-2",
          )}
        >
          <span className={cn("w-5 h-5 rounded-full", opcao.dot)} />
        </button>
      ))}
    </div>
  );
}
