import type { Conteudo, Produto } from "@meugerente/shared";
import { useDroppable } from "@dnd-kit/core";
import { chaveDia, mesmoDia, NOMES_DIA_CURTO } from "../../lib/calendar-utils";
import { cn } from "../../lib/utils";
import { ConteudoBlocoSemana } from "./ConteudoBlocoSemana";

interface CalendarioSemanaProps {
  dias: Date[];
  conteudos: Conteudo[];
  produtosPorId: Map<string, Produto>;
  onSelecionar: (conteudo: Conteudo) => void;
}

function ColunaDia({
  dia,
  conteudos,
  produtosPorId,
  hoje,
  onSelecionar,
}: {
  dia: Date;
  conteudos: Conteudo[];
  produtosPorId: Map<string, Produto>;
  hoje: boolean;
  onSelecionar: (conteudo: Conteudo) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: chaveDia(dia) });

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex flex-col items-center gap-1 py-2">
        <span className="text-caption text-neutral-600">{NOMES_DIA_CURTO[dia.getDay()]}</span>
        <span
          className={cn(
            "text-h3 w-8 h-8 flex items-center justify-center rounded-full",
            hoje ? "bg-neutral-900 text-neutral-50" : "text-neutral-900",
          )}
        >
          {dia.getDate()}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-20 sm:min-h-[420px] flex flex-col gap-2 p-3 rounded-lg bg-neutral-75 transition-colors",
          isOver && "bg-neutral-150",
        )}
      >
        {conteudos.map((conteudo) => (
          <ConteudoBlocoSemana
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

/** Visão Semana — colunas mais largas e arejadas que o mês, sem grade de hora (Conteúdo só tem data). */
export function CalendarioSemana({ dias, conteudos, produtosPorId, onSelecionar }: CalendarioSemanaProps) {
  const hoje = new Date();
  const conteudosPorDia = new Map<string, Conteudo[]>();
  for (const conteudo of conteudos) {
    if (!conteudo.dataPrevista) continue;
    const chave = chaveDia(new Date(conteudo.dataPrevista));
    conteudosPorDia.set(chave, [...(conteudosPorDia.get(chave) ?? []), conteudo]);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
      {dias.map((dia) => (
        <ColunaDia
          key={dia.toISOString()}
          dia={dia}
          conteudos={conteudosPorDia.get(chaveDia(dia)) ?? []}
          produtosPorId={produtosPorId}
          hoje={mesmoDia(dia, hoje)}
          onSelecionar={onSelecionar}
        />
      ))}
    </div>
  );
}
