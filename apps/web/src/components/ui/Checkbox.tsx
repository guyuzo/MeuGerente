import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
}

/** Checkbox com visual próprio (o nativo do navegador quebra o design system) — input real fica escondido só pra acessibilidade/teclado. */
export function Checkbox({ id, checked, onChange, label, className }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "w-5 h-5 shrink-0 rounded-sm border flex items-center justify-center transition-colors",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-2",
          checked ? "bg-neutral-900 border-neutral-900" : "bg-neutral-50 border-neutral-400",
        )}
      >
        {checked && <Check size={13} strokeWidth={3} className="text-neutral-50" />}
      </span>
      {label && <span className="text-body text-neutral-900">{label}</span>}
    </label>
  );
}
