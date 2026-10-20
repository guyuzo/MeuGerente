import { AlertTriangle, Clock } from "lucide-react";
import { diasAte } from "../../lib/utils";

/**
 * Sinalização de prazo do PRD (seção 8.3): cor nunca sozinha, sempre com texto.
 * >5 dias: neutral-600 · 1 a 5 dias: warning · vencido: error.
 */
export function DeadlineTag({ prazoConteudo }: { prazoConteudo?: string }) {
  const dias = diasAte(prazoConteudo);
  if (dias === undefined) {
    return <span className="text-caption text-neutral-600">Sem prazo definido</span>;
  }

  if (dias < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium text-error">
        <AlertTriangle size={13} />
        Atrasado há {Math.abs(dias)} {Math.abs(dias) === 1 ? "dia" : "dias"}
      </span>
    );
  }

  if (dias <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium text-warning">
        <Clock size={13} />
        {dias === 0 ? "Vence hoje" : `Vence em ${dias} ${dias === 1 ? "dia" : "dias"}`}
      </span>
    );
  }

  return <span className="text-caption text-neutral-600">Vence em {dias} dias</span>;
}
