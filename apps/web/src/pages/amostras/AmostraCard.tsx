import type { Amostra, Produto } from "@meugerente/shared";
import { useDraggable } from "@dnd-kit/core";
import { CalendarClock, Timer } from "lucide-react";
import { ProductThumb, TOM_CARTAO } from "../../components/shared";
import { DeadlineTag } from "../../components/shared/DeadlineTag";
import type { BadgeTone } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { cn, diasDesde } from "../../lib/utils";

interface AmostraCardProps {
  amostra: Amostra;
  produto?: Produto;
  arrastavel?: boolean;
  tom?: BadgeTone;
  onDefinirPrazo?: (amostra: Amostra) => void;
}

const ORIGEM_LABEL: Record<Amostra["origem"], string> = {
  gratuita: "Gratuita",
  comprada: "Comprada",
  parceria: "Parceria",
};

export function AmostraCard({ amostra, produto, arrastavel = true, tom, onDefinirPrazo }: AmostraCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: amostra.id,
    disabled: !arrastavel,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...(arrastavel ? { ...listeners, ...attributes } : {})}>
      <Card
        className={cn(
          "p-4 flex flex-col gap-2 touch-none",
          tom && TOM_CARTAO[tom],
          arrastavel && "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50",
        )}
      >
        <div className="flex items-center gap-3">
          <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
          <span className="text-body-strong font-medium truncate">{produto?.nome ?? "Produto removido"}</span>
        </div>
        <div className="flex items-center justify-between text-caption text-neutral-600">
          <span>{ORIGEM_LABEL[amostra.origem]}</span>
          {amostra.status === "para_publicar" &&
            (amostra.prazoConteudo ? (
              <DeadlineTag prazoConteudo={amostra.prazoConteudo} />
            ) : (
              onDefinirPrazo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDefinirPrazo(amostra);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900"
                >
                  <CalendarClock size={13} />
                  Definir prazo
                </button>
              )
            ))}
          {amostra.status === "publicado" && amostra.publicadoEm && (
            <span className="flex items-center gap-1 text-blue-700 font-medium">
              <Timer size={13} />
              {diasDesde(amostra.publicadoEm)} {diasDesde(amostra.publicadoEm) === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
