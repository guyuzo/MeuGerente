import type { Amostra, Produto } from "@meugerente/shared";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, X } from "lucide-react";
import { TOM_FUNDO } from "../../components/shared";
import type { BadgeTone } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";
import { AmostraCard } from "./AmostraCard";

interface AmostraColumnProps {
  id: string;
  titulo: string;
  amostras: Amostra[];
  produtosPorId: Map<string, Produto>;
  arrastavel?: boolean;
  tom?: BadgeTone;
  customizada?: boolean;
  onRemover?: () => void;
  onEditar?: () => void;
  onDefinirPrazo?: (amostra: Amostra) => void;
}

export function AmostraColumn({
  id,
  titulo,
  amostras,
  produtosPorId,
  arrastavel = true,
  tom = "neutral",
  customizada = false,
  onRemover,
  onEditar,
  onDefinirPrazo,
}: AmostraColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !arrastavel });
  const sortable = useSortable({
    id: `col-${id}`,
    data: { type: customizada ? "coluna" : "status", colunaId: id },
  });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div
        ref={sortable.setNodeRef}
        style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
        className={cn("flex items-center gap-1 mb-3 px-1", sortable.isDragging && "opacity-50")}
      >
        <button
          type="button"
          title="Arrastar pra reordenar"
          className="w-5 h-5 shrink-0 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-grab active:cursor-grabbing touch-none"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <GripVertical size={14} />
        </button>
        <span className="text-h3 text-neutral-900 truncate">{titulo}</span>
        <span className="text-caption text-neutral-600 shrink-0">{amostras.length}</span>
        {customizada && (
          <div className="ml-auto flex items-center gap-0.5 shrink-0">
            {onEditar && (
              <button
                type="button"
                title="Editar coluna"
                onClick={onEditar}
                className="w-6 h-6 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
              >
                <Pencil size={12} />
              </button>
            )}
            {onRemover && (
              <button
                type="button"
                title="Remover coluna"
                onClick={onRemover}
                className="w-6 h-6 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-3 min-h-24 p-4 rounded-lg transition-colors",
          TOM_FUNDO[tom],
          isOver && "bg-neutral-200",
        )}
      >
        {amostras.map((amostra) => (
          <AmostraCard
            key={amostra.id}
            amostra={amostra}
            produto={produtosPorId.get(amostra.produtoId)}
            arrastavel={arrastavel}
            tom={tom}
            onDefinirPrazo={onDefinirPrazo}
          />
        ))}
      </div>
    </div>
  );
}
