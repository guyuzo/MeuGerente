import type { Amostra, Conteudo, Produto } from "@meugerente/shared";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DeadlineTag, ProductThumb } from "../../components/shared";
import { Card } from "../../components/ui/Card";
import { formatarData } from "../../lib/utils";

interface AtencaoListaProps {
  amostrasEmRisco: Amostra[];
  conteudosAtrasados: Conteudo[];
  produtosPorId: Map<string, Produto>;
}

/** Bloco "Precisa da sua atenção" do Dashboard (PRD seção 8.1) — cada linha leva ao módulo correspondente. */
export function AtencaoLista({ amostrasEmRisco, conteudosAtrasados, produtosPorId }: AtencaoListaProps) {
  const semPendencias = amostrasEmRisco.length === 0 && conteudosAtrasados.length === 0;

  return (
    <Card className="h-full">
      <h2 className="text-h2 text-neutral-900 mb-4">Precisa da sua atenção</h2>

      {semPendencias && (
        <div className="flex flex-col items-center text-center py-8 text-neutral-600">
          <CheckCircle2 size={20} className="mb-2 text-success" />
          <p className="text-body">Nada pendente por enquanto.</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {amostrasEmRisco.map((amostra) => {
          const produto = produtosPorId.get(amostra.produtoId);
          return (
            <Link
              key={amostra.id}
              to="/amostras"
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-neutral-100"
            >
              <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-body-strong font-medium truncate">{produto?.nome ?? "Produto removido"}</p>
                <p className="text-caption text-neutral-600">Amostra recebida sem conteúdo</p>
              </div>
              <DeadlineTag prazoConteudo={amostra.prazoConteudo} />
            </Link>
          );
        })}

        {conteudosAtrasados.map((conteudo) => {
          const produto = produtosPorId.get(conteudo.produtoId);
          return (
            <Link
              key={conteudo.id}
              to="/calendario"
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-neutral-100"
            >
              <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-body-strong font-medium truncate">{conteudo.titulo}</p>
                <p className="text-caption text-neutral-600">Previsto para {formatarData(conteudo.dataPrevista)}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-caption font-medium text-error">
                <AlertTriangle size={13} />
                Atrasado
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
