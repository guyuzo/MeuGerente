import { useMemo } from "react";
import { CardMetrica } from "../../components/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { useAmostras } from "../../hooks/useAmostras";
import { useConteudos } from "../../hooks/useConteudos";
import { useProdutos } from "../../hooks/useProdutos";
import { useResumoVendas } from "../../hooks/useVendas";
import { inicioDaSemana, somarDias } from "../../lib/calendar-utils";
import { diasAte, formatarMoeda } from "../../lib/utils";
import { AtencaoLista } from "./AtencaoLista";

export function DashboardPage() {
  const amostrasQuery = useAmostras();
  const conteudosQuery = useConteudos();
  const produtosQuery = useProdutos();

  const periodoMesAtual = useMemo(() => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    return { inicio: inicio.toISOString(), fim: fim.toISOString() };
  }, []);
  const resumoVendasQuery = useResumoVendas(periodoMesAtual);

  const produtosPorId = useMemo(
    () => new Map((produtosQuery.data ?? []).map((produto) => [produto.id, produto])),
    [produtosQuery.data],
  );

  const conteudoPublicadoPorAmostra = useMemo(
    () =>
      new Set(
        (conteudosQuery.data ?? [])
          .filter((c) => c.status === "publicado" && c.amostraId)
          .map((c) => c.amostraId as string),
      ),
    [conteudosQuery.data],
  );

  const amostrasAguardandoConteudo = useMemo(
    () =>
      (amostrasQuery.data ?? []).filter(
        (amostra) => amostra.status === "para_publicar" && !conteudoPublicadoPorAmostra.has(amostra.id),
      ),
    [amostrasQuery.data, conteudoPublicadoPorAmostra],
  );

  const amostrasEmRisco = useMemo(
    () =>
      amostrasAguardandoConteudo
        .filter((amostra) => {
          const dias = diasAte(amostra.prazoConteudo);
          return dias !== undefined && dias <= 5;
        })
        .sort((a, b) => (diasAte(a.prazoConteudo) ?? 0) - (diasAte(b.prazoConteudo) ?? 0)),
    [amostrasAguardandoConteudo],
  );

  const vencemEm3Dias = amostrasAguardandoConteudo.filter((a) => {
    const dias = diasAte(a.prazoConteudo);
    return dias !== undefined && dias >= 0 && dias <= 3;
  }).length;

  const conteudosPrevistosSemana = useMemo(() => {
    const inicio = inicioDaSemana(new Date());
    const fim = somarDias(inicio, 7);
    return (conteudosQuery.data ?? []).filter((c) => {
      if (!c.dataPrevista) return false;
      const data = new Date(c.dataPrevista);
      return data >= inicio && data < fim;
    });
  }, [conteudosQuery.data]);

  const conteudosAtrasados = useMemo(
    () =>
      (conteudosQuery.data ?? []).filter((c) => {
        if (c.status === "publicado" || !c.dataPrevista) return false;
        return (diasAte(c.dataPrevista) ?? 0) < 0;
      }),
    [conteudosQuery.data],
  );

  const carregando = amostrasQuery.isLoading || conteudosQuery.isLoading || produtosQuery.isLoading;
  const comErro = amostrasQuery.isError || conteudosQuery.isError || produtosQuery.isError;

  if (carregando) return <Spinner label="Carregando dashboard..." />;
  if (comErro) return <ErrorState onTentarNovamente={() => amostrasQuery.refetch()} />;

  return (
    <div>
      <PageHeader titulo="Dashboard" descricao="O que você precisa fazer agora." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <CardMetrica
          label="Amostras aguardando conteúdo"
          valor={String(amostrasAguardandoConteudo.length)}
          nota={vencemEm3Dias > 0 ? `${vencemEm3Dias} vencem em 3 dias` : undefined}
        />
        <CardMetrica label="Conteúdos previstos esta semana" valor={String(conteudosPrevistosSemana.length)} />
        <CardMetrica
          label="GMV do mês"
          valor={resumoVendasQuery.data ? formatarMoeda(resumoVendasQuery.data.gmvTotal) : "—"}
        />
        <CardMetrica
          label="Comissão confirmada"
          valor={resumoVendasQuery.data ? formatarMoeda(resumoVendasQuery.data.comissaoConfirmada) : "—"}
          nota={resumoVendasQuery.data ? `de ${formatarMoeda(resumoVendasQuery.data.comissaoTotal)} no total` : undefined}
          destaque
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardMetrica label="Pedidos do mês" valor={resumoVendasQuery.data ? String(resumoVendasQuery.data.pedidos) : "—"} />
        <CardMetrica
          label="Itens vendidos no mês"
          valor={resumoVendasQuery.data ? String(resumoVendasQuery.data.itensVendidos) : "—"}
        />
      </div>

      {/*
        PRD seção 8.1 pede bloco 2/3 (gráfico de comissão) + 1/3 (atenção). O gráfico ainda não
        existe — por enquanto os números do mês entram como cartões acima, e só o bloco de
        atenção ocupa a área de conteúdo principal.
      */}
      <div className="max-w-xl">
        <AtencaoLista
          amostrasEmRisco={amostrasEmRisco}
          conteudosAtrasados={conteudosAtrasados}
          produtosPorId={produtosPorId}
        />
      </div>
    </div>
  );
}
