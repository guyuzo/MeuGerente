import type { Conteudo, Produto } from "@meugerente/shared";
import { useDraggable } from "@dnd-kit/core";
import { conteudoStatusMap, TOM_CARTAO } from "../../components/shared";
import { cn } from "../../lib/utils";

interface ConteudoChipProps {
  conteudo: Conteudo;
  produto?: Produto;
  onClick: () => void;
}

export function ConteudoChip({ conteudo, produto, onClick }: ConteudoChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: conteudo.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={cn(
        "w-full text-left px-2 py-1 rounded-sm bg-neutral-100 hover:bg-neutral-150 touch-none cursor-grab active:cursor-grabbing",
        TOM_CARTAO[conteudoStatusMap[conteudo.status].tone],
        isDragging && "opacity-50",
      )}
    >
      <p className="text-micro text-neutral-900 truncate">{conteudo.titulo}</p>
      {produto && <p className="text-micro text-neutral-600 truncate">{produto.nome}</p>}
    </button>
  );
}
