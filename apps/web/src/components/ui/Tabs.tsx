import { cn } from "../../lib/utils";

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Alternador de visão/período (design-system.md seção 5: ativo neutral-900+branco, inativo transparente+neutral-600). */
export function Tabs<T extends string>({ options, value, onChange }: TabsProps<T>) {
  return (
    <div className="inline-flex items-center gap-1 h-10 p-1 bg-neutral-150 rounded-md" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 px-3 rounded-sm text-body-strong font-medium transition-colors",
            option.value === value ? "bg-neutral-900 text-neutral-50" : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
