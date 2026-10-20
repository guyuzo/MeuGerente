import type { Conteudo, Produto } from "@meugerente/shared";
import { chaveDia, mesmoDia, NOMES_DIA_CURTO } from "../../lib/calendar-utils";
import { DayCell } from "./DayCell";

interface CalendarioGradeProps {
  dias: Date[];
  mesReferencia?: number;
  conteudos: Conteudo[];
  produtosPorId: Map<string, Produto>;
  onSelecionar: (conteudo: Conteudo) => void;
}

/** Grade compartilhada pelas visões mês e semana — só muda a lista de dias recebida. */
export function CalendarioGrade({ dias, mesReferencia, conteudos, produtosPorId, onSelecionar }: CalendarioGradeProps) {
  const hoje = new Date();
  const conteudosPorDia = new Map<string, Conteudo[]>();
  for (const conteudo of conteudos) {
    if (!conteudo.dataPrevista) continue;
    const chave = chaveDia(new Date(conteudo.dataPrevista));
    conteudosPorDia.set(chave, [...(conteudosPorDia.get(chave) ?? []), conteudo]);
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {NOMES_DIA_CURTO.map((nome) => (
          <div key={nome} className="text-caption text-neutral-600 text-center py-1">
            {nome}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => (
          <DayCell
            key={dia.toISOString()}
            data={dia}
            conteudos={conteudosPorDia.get(chaveDia(dia)) ?? []}
            produtosPorId={produtosPorId}
            foraDoMes={mesReferencia !== undefined && dia.getMonth() !== mesReferencia}
            hoje={mesmoDia(dia, hoje)}
            onSelecionar={onSelecionar}
          />
        ))}
      </div>
    </div>
  );
}
