import type { Conteudo, Produto } from "@meugerente/shared";
import { conteudoStatusMap, ProductThumb, StatusPill, TOM_CARTAO } from "../../components/shared";
import { Card } from "../../components/ui/Card";
import { chaveDia, mesmoDia, NOMES_DIA_CURTO, NOMES_MES } from "../../lib/calendar-utils";
import { cn } from "../../lib/utils";

interface CalendarioListaProps {
  conteudos: Conteudo[];
  produtosPorId: Map<string, Produto>;
  onSelecionar: (conteudo: Conteudo) => void;
}

interface GrupoDia {
  chave: string;
  data: Date;
  conteudos: Conteudo[];
}

function agruparPorDia(conteudos: Conteudo[]): GrupoDia[] {
  const comData = conteudos.filter((c): c is Conteudo & { dataPrevista: string } => Boolean(c.dataPrevista));
  const ordenados = [...comData].sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));

  const grupos = new Map<string, GrupoDia>();
  for (const conteudo of ordenados) {
    const data = new Date(conteudo.dataPrevista);
    const chave = chaveDia(data);
    const existente = grupos.get(chave);
    if (existente) existente.conteudos.push(conteudo);
    else grupos.set(chave, { chave, data, conteudos: [conteudo] });
  }
  return [...grupos.values()];
}

/** Visão "Lista" agrupada por dia — cada dia vira uma seção, no lugar de uma lista corrida sem separação. */
export function CalendarioLista({ conteudos, produtosPorId, onSelecionar }: CalendarioListaProps) {
  const hoje = new Date();
  const grupos = agruparPorDia(conteudos);

  return (
    <div className="flex flex-col gap-5">
      {grupos.map((grupo) => (
        <div key={grupo.chave}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className={cn("text-h3", mesmoDia(grupo.data, hoje) ? "text-neutral-900" : "text-neutral-700")}>
              {NOMES_DIA_CURTO[grupo.data.getDay()]}, {grupo.data.getDate()} de {NOMES_MES[grupo.data.getMonth()].toLowerCase()}
            </span>
            {mesmoDia(grupo.data, hoje) && <StatusPill label="Hoje" tone="accent" />}
            <span className="text-caption text-neutral-600">{grupo.conteudos.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {grupo.conteudos.map((conteudo) => {
              const produto = produtosPorId.get(conteudo.produtoId);
              return (
                <Card
                  key={conteudo.id}
                  className={cn(
                    "p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-100",
                    TOM_CARTAO[conteudoStatusMap[conteudo.status].tone],
                  )}
                  onClick={() => onSelecionar(conteudo)}
                >
                  <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
                  <span className="text-body-strong font-medium flex-1 min-w-0 truncate">{conteudo.titulo}</span>
                  <StatusPill {...conteudoStatusMap[conteudo.status]} />
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
