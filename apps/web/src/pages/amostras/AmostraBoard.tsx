import type { Amostra, Produto } from "@meugerente/shared";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import type { BadgeTone } from "../../components/ui/Badge";
import { AmostraColumn } from "./AmostraColumn";

export interface ColunaKanban {
  id: string;
  titulo: string;
  amostras: Amostra[];
  arrastavel?: boolean;
  removivel?: boolean;
  tom?: BadgeTone;
}

interface AmostraBoardProps {
  colunas: ColunaKanban[];
  produtosPorId: Map<string, Produto>;
  onMoverAmostra: (amostraId: string, destinoId: string) => void;
  onRemoverColuna?: (colunaId: string) => void;
  onEditarColuna?: (colunaId: string) => void;
  onReordenarColuna?: (colunaId: string, destinoId: string) => void;
  onReordenarStatus?: (statusId: string, destinoId: string) => void;
  onDefinirPrazo?: (amostra: Amostra) => void;
  rodape?: ReactNode;
}

/** Quadro por status do módulo Amostras (PRD seção 8.3), mais colunas extras criadas pelo usuário — todas reordenáveis. */
export function AmostraBoard({
  colunas,
  produtosPorId,
  onMoverAmostra,
  onRemoverColuna,
  onEditarColuna,
  onReordenarColuna,
  onReordenarStatus,
  onDefinirPrazo,
  rodape,
}: AmostraBoardProps) {
  const idsColunasSortable = colunas.map((c) => `col-${c.id}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const tipo = active.data.current?.type as "coluna" | "status" | undefined;
    if (tipo === "coluna" || tipo === "status") {
      const origemId = active.data.current?.colunaId as string;
      const tipoDestino = over.data.current?.type;
      if (tipoDestino !== tipo) return; // só reordena dentro do mesmo grupo (fixas entre si, customizadas entre si)
      const destinoId = over.data.current?.colunaId as string;
      if (tipo === "coluna") onReordenarColuna?.(origemId, destinoId);
      else onReordenarStatus?.(origemId, destinoId);
      return;
    }

    onMoverAmostra(active.id as string, over.id as string);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={idsColunasSortable} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {colunas.map((coluna) => (
            <AmostraColumn
              key={coluna.id}
              id={coluna.id}
              titulo={coluna.titulo}
              amostras={coluna.amostras}
              produtosPorId={produtosPorId}
              arrastavel={coluna.arrastavel}
              tom={coluna.tom}
              customizada={coluna.removivel}
              onRemover={coluna.removivel ? () => onRemoverColuna?.(coluna.id) : undefined}
              onEditar={coluna.removivel ? () => onEditarColuna?.(coluna.id) : undefined}
              onDefinirPrazo={onDefinirPrazo}
            />
          ))}
          {rodape}
        </div>
      </SortableContext>
    </DndContext>
  );
}
