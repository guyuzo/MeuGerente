import type { Conteudo } from "@meugerente/shared";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { Tabs } from "../../components/ui/Tabs";
import { useAtualizarConteudo, useConteudos } from "../../hooks/useConteudos";
import { useProdutos } from "../../hooks/useProdutos";
import { diasDaSemana, inicioDaSemana, matrizDoMes, NOMES_MES, somarDias } from "../../lib/calendar-utils";
import { CalendarioGrade } from "./CalendarioGrade";
import { CalendarioLista } from "./CalendarioLista";
import { CalendarioSemana } from "./CalendarioSemana";
import { ConteudoPainel } from "./ConteudoPainel";
import { CronogramaModal } from "./CronogramaModal";

type Visao = "mes" | "semana" | "lista";

// Meta de ritmo de publicação (PRD seção 8.4). Fica fixa até existir tela de Configurações.
const META_PUBLICACOES_SEMANA = 5;

export function CalendarioPage() {
  const conteudosQuery = useConteudos();
  const produtosQuery = useProdutos();
  const atualizarConteudo = useAtualizarConteudo();

  const [visao, setVisao] = useState<Visao>("mes");
  const [referencia, setReferencia] = useState(new Date());
  const [conteudoSelecionado, setConteudoSelecionado] = useState<Conteudo | undefined>();
  const [modalCronogramaAberto, setModalCronogramaAberto] = useState(false);

  const produtosPorId = useMemo(
    () => new Map((produtosQuery.data ?? []).map((produto) => [produto.id, produto])),
    [produtosQuery.data],
  );

  const dias = useMemo(() => {
    if (visao === "mes") return matrizDoMes(referencia).flat();
    if (visao === "semana") return diasDaSemana(referencia);
    return [];
  }, [visao, referencia]);

  const publicacoesNaSemana = useMemo(() => {
    const inicio = inicioDaSemana(new Date());
    const fim = somarDias(inicio, 7);
    return (conteudosQuery.data ?? []).filter((conteudo) => {
      if (conteudo.status !== "publicado" || !conteudo.dataPublicacao) return false;
      const data = new Date(conteudo.dataPublicacao);
      return data >= inicio && data < fim;
    }).length;
  }, [conteudosQuery.data]);

  function navegar(direcao: -1 | 0 | 1) {
    if (direcao === 0) {
      setReferencia(new Date());
      return;
    }
    setReferencia((atual) => {
      if (visao === "semana") return somarDias(atual, direcao * 7);
      const proxima = new Date(atual);
      proxima.setMonth(proxima.getMonth() + direcao);
      return proxima;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const conteudo = (conteudosQuery.data ?? []).find((c) => c.id === active.id);
    if (!conteudo) return;
    const novaData = new Date(`${over.id}T00:00:00`).toISOString();
    if (conteudo.dataPrevista === novaData) return;
    atualizarConteudo.mutate({ id: conteudo.id, input: { dataPrevista: novaData } });
  }

  const carregando = conteudosQuery.isLoading || produtosQuery.isLoading;
  const comErro = conteudosQuery.isError || produtosQuery.isError;
  const semDados = conteudosQuery.isSuccess && (conteudosQuery.data?.length ?? 0) === 0;

  return (
    <div>
      <PageHeader
        titulo="Calendário"
        descricao="Grade de conteúdo por data e status de produção."
        acao={
          <Button variant="brand" onClick={() => setModalCronogramaAberto(true)}>
            <Sparkles size={16} />
            Montar cronograma
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {visao !== "lista" && (
            <>
              <button
                type="button"
                aria-label="Período anterior"
                onClick={() => navegar(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-h3 text-neutral-900 w-40 text-center">
                {NOMES_MES[referencia.getMonth()]} {referencia.getFullYear()}
              </span>
              <button
                type="button"
                aria-label="Próximo período"
                onClick={() => navegar(1)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
              >
                <ChevronRight size={16} />
              </button>
              <Button variant="secondary" onClick={() => navegar(0)}>
                Hoje
              </Button>
            </>
          )}
        </div>
        <Tabs
          options={[
            { value: "mes", label: "Mês" },
            { value: "semana", label: "Semana" },
            { value: "lista", label: "Lista" },
          ]}
          value={visao}
          onChange={setVisao}
        />
      </div>

      <div className="flex items-center gap-3 mb-4 text-caption text-neutral-600">
        <span className="shrink-0">
          {publicacoesNaSemana} de {META_PUBLICACOES_SEMANA} publicações essa semana
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-neutral-200 max-w-xs">
          <div
            className="h-full rounded-full bg-purple-400"
            style={{ width: `${Math.min(100, (publicacoesNaSemana / META_PUBLICACOES_SEMANA) * 100)}%` }}
          />
        </div>
      </div>

      {carregando && <Spinner label="Carregando calendário..." />}

      {comErro && <ErrorState onTentarNovamente={() => conteudosQuery.refetch()} />}

      {!carregando && !comErro && semDados && (
        <EmptyState
          icon={CalendarDays}
          titulo="Nenhum conteúdo agendado"
          descricao="Crie um conteúdo a partir de um produto para ele aparecer aqui."
        />
      )}

      {!carregando && !comErro && !semDados && (
        <DndContext onDragEnd={handleDragEnd}>
          {visao === "lista" && (
            <CalendarioLista
              conteudos={conteudosQuery.data ?? []}
              produtosPorId={produtosPorId}
              onSelecionar={setConteudoSelecionado}
            />
          )}
          {visao === "semana" && (
            <CalendarioSemana
              dias={dias}
              conteudos={conteudosQuery.data ?? []}
              produtosPorId={produtosPorId}
              onSelecionar={setConteudoSelecionado}
            />
          )}
          {visao === "mes" && (
            <CalendarioGrade
              dias={dias}
              mesReferencia={referencia.getMonth()}
              conteudos={conteudosQuery.data ?? []}
              produtosPorId={produtosPorId}
              onSelecionar={setConteudoSelecionado}
            />
          )}
        </DndContext>
      )}

      <ConteudoPainel
        conteudo={conteudoSelecionado}
        produto={conteudoSelecionado ? produtosPorId.get(conteudoSelecionado.produtoId) : undefined}
        onFechar={() => setConteudoSelecionado(undefined)}
      />

      <CronogramaModal
        aberto={modalCronogramaAberto}
        onFechar={() => setModalCronogramaAberto(false)}
        produtos={produtosQuery.data ?? []}
      />
    </div>
  );
}
