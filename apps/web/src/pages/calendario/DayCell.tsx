import type { Conteudo, Produto } from "@meugerente/shared";
import { useDroppable } from "@dnd-kit/core";
import { chaveDia } from "../../lib/calendar-utils";
import { cn } from "../../lib/utils";
import { ConteudoChip } from "./ConteudoChip";
import { ConteudoPonto } from "./ConteudoPonto";

interface DayCellProps {
  data: Date;
  conteudos: Conteudo[];
  produtosPorId: Map<string, Produto>;
  foraDoMes?: boolean;
  hoje?: boolean;
  onSelecionar: (conteudo: Conteudo) => void;
}

export function DayCell({ data, conteudos, produtosPorId, foraDoMes, hoje, onSelecionar }: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: chaveDia(data) });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-14 sm:min-h-28 p-1.5 sm:p-2 rounded-md flex flex-col gap-1",
        foraDoMes ? "bg-transparent" : "bg-neutral-75",
        isOver && "bg-neutral-150",
      )}
    >
      <span
        className={cn(
          "text-caption",
          foraDoMes ? "text-neutral-500" : "text-neutral-600",
          hoje && "inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-neutral-50",
        )}
      >
        {data.getDate()}
      </span>

      {/* Abaixo de sm, chip com título não cabe na célula — vira ponto de cor; a Lista é a visão de leitura no mobile. */}
      <div className="flex sm:hidden flex-wrap gap-1">
        {conteudos.map((conteudo) => (
          <ConteudoPonto key={conteudo.id} conteudo={conteudo} onClick={() => onSelecionar(conteudo)} />
        ))}
      </div>
      <div className="hidden sm:flex flex-col gap-1">
        {conteudos.map((conteudo) => (
          <ConteudoChip
            key={conteudo.id}
            conteudo={conteudo}
            produto={produtosPorId.get(conteudo.produtoId)}
            onClick={() => onSelecionar(conteudo)}
          />
        ))}
      </div>
    </div>
  );
}
