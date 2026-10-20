import type { Conteudo, Produto } from "@meugerente/shared";
import { useDraggable } from "@dnd-kit/core";
import { conteudoStatusMap, ProductThumb, TOM_CARTAO } from "../../components/shared";
import { cn } from "../../lib/utils";

interface ConteudoBlocoSemanaProps {
  conteudo: Conteudo;
  produto?: Produto;
  onClick: () => void;
}

/** Bloco maior que o chip do mês — a Semana tem menos colunas e mais espaço vertical por dia. */
export function ConteudoBlocoSemana({ conteudo, produto, onClick }: ConteudoBlocoSemanaProps) {
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
        "w-full text-left p-2 rounded-md bg-neutral-100 hover:bg-neutral-150 touch-none cursor-grab active:cursor-grabbing flex items-center gap-2",
        TOM_CARTAO[conteudoStatusMap[conteudo.status].tone],
        isDragging && "opacity-50",
      )}
    >
      <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
      <div className="min-w-0">
        <p className="text-caption font-medium text-neutral-900 truncate">{conteudo.titulo}</p>
        {produto && <p className="text-micro text-neutral-600 truncate">{produto.nome}</p>}
      </div>
    </button>
  );
}
