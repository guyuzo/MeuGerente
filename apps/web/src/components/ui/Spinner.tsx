import { Loader2 } from "lucide-react";

/** Estado de carregamento obrigatório (PRD seção 10). */
export function Spinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-600">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-caption">{label}</span>
    </div>
  );
}
