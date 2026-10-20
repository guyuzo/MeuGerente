import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

/** Estado vazio obrigatório em toda lista (PRD seção 10) — sempre com uma ação, nunca só uma frase. */
export function EmptyState({ icon: Icon, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-neutral-150 flex items-center justify-center mb-4">
        <Icon size={20} className="text-neutral-600" />
      </div>
      <p className="text-h3 text-neutral-900 mb-1">{titulo}</p>
      {descricao && <p className="text-body text-neutral-600 max-w-sm mb-4">{descricao}</p>}
      {acao}
    </div>
  );
}
