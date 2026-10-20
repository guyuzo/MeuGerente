import type { Amostra, AmostraStatus } from "@meugerente/shared";
import { arrayMove } from "@dnd-kit/sortable";
import { Gift, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AMOSTRA_COLUNAS_KANBAN, amostraStatusMap } from "../../components/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { Tabs } from "../../components/ui/Tabs";
import { useAmostraColunas, useAtualizarAmostraColuna, useDeletarAmostraColuna } from "../../hooks/useAmostraColunas";
import { useAmostras, useAtualizarAmostra, useMudarStatusAmostra } from "../../hooks/useAmostras";
import { useProdutos } from "../../hooks/useProdutos";
import { AmostraBoard, type ColunaKanban } from "./AmostraBoard";
import { AmostraTable } from "./AmostraTable";
import { EditarColunaModal } from "./EditarColunaModal";
import { NovaAmostraModal } from "./NovaAmostraModal";
import { NovaColunaBotao } from "./NovaColunaBotao";
import { PrazoModal } from "./PrazoModal";

type Visao = "quadro" | "tabela";

const STATUS_VALIDOS = new Set<string>(AMOSTRA_COLUNAS_KANBAN);
const CHAVE_ORDEM_STATUS = "meugerente-ordem-status-amostra";

/** Ordem das colunas fixas é preferência de tela, não dado — fica só no navegador. */
function lerOrdemStatusSalva(): AmostraStatus[] {
  try {
    const salvo = localStorage.getItem(CHAVE_ORDEM_STATUS);
    if (salvo) {
      const lista = JSON.parse(salvo) as string[];
      const validos = lista.filter((s): s is AmostraStatus => STATUS_VALIDOS.has(s));
      const faltando = AMOSTRA_COLUNAS_KANBAN.filter((s) => !validos.includes(s));
      if (validos.length > 0) return [...validos, ...faltando];
    }
  } catch {
    // localStorage indisponível — cai na ordem padrão.
  }
  return AMOSTRA_COLUNAS_KANBAN;
}

export function AmostrasPage() {
  const amostrasQuery = useAmostras();
  const produtosQuery = useProdutos();
  const colunasQuery = useAmostraColunas();
  const mudarStatus = useMudarStatusAmostra();
  const atualizar = useAtualizarAmostra();
  const deletarColuna = useDeletarAmostraColuna();
  const atualizarColuna = useAtualizarAmostraColuna();

  const [visao, setVisao] = useState<Visao>("quadro");
  const [amostraParaPrazo, setAmostraParaPrazo] = useState<Amostra | undefined>();
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [colunaParaEditarId, setColunaParaEditarId] = useState<string | undefined>();
  const [ordemStatus, setOrdemStatus] = useState<AmostraStatus[]>(lerOrdemStatusSalva);

  const produtosPorId = useMemo(
    () => new Map((produtosQuery.data ?? []).map((produto) => [produto.id, produto])),
    [produtosQuery.data],
  );

  const colunas: ColunaKanban[] = useMemo(() => {
    const amostras = amostrasQuery.data ?? [];
    const fixas: ColunaKanban[] = ordemStatus.map((status) => ({
      id: status,
      titulo: amostraStatusMap[status].label,
      tom: amostraStatusMap[status].tone,
      amostras: amostras.filter((amostra) => amostra.status === status && !amostra.colunaCustomizadaId),
    }));
    const customizadas: ColunaKanban[] = (colunasQuery.data ?? []).map((coluna) => ({
      id: coluna.id,
      titulo: coluna.nome,
      tom: coluna.cor,
      removivel: true,
      amostras: amostras.filter((amostra) => amostra.colunaCustomizadaId === coluna.id),
    }));
    return [...fixas, ...customizadas];
  }, [amostrasQuery.data, colunasQuery.data, ordemStatus]);

  function handleMoverAmostra(amostraId: string, destinoId: string) {
    const amostra = (amostrasQuery.data ?? []).find((a) => a.id === amostraId);
    if (!amostra) return;

    if (STATUS_VALIDOS.has(destinoId)) {
      const novoStatus = destinoId as AmostraStatus;
      if (amostra.status === novoStatus && !amostra.colunaCustomizadaId) return;
      mudarStatus.mutate({ id: amostraId, status: novoStatus });
      return;
    }

    // Destino é uma coluna customizada — não mexe em status/prazo, só onde o card aparece.
    if (amostra.colunaCustomizadaId === destinoId) return;
    atualizar.mutate({ id: amostraId, input: { colunaCustomizadaId: destinoId } });
  }

  function handleRemoverColuna(colunaId: string) {
    if (!window.confirm("Remover essa coluna? As amostras nela voltam pro status delas.")) return;
    deletarColuna.mutate(colunaId);
  }

  function handleReordenarColuna(origemId: string, destinoId: string) {
    if (origemId === destinoId) return;
    const lista = colunasQuery.data ?? [];
    const indiceOrigem = lista.findIndex((c) => c.id === origemId);
    const indiceDestino = lista.findIndex((c) => c.id === destinoId);
    if (indiceOrigem === -1 || indiceDestino === -1) return;
    const reordenada = arrayMove(lista, indiceOrigem, indiceDestino);
    reordenada.forEach((coluna, indice) => {
      if (coluna.ordem !== indice) {
        atualizarColuna.mutate({ id: coluna.id, input: { ordem: indice } });
      }
    });
  }

  function handleReordenarStatus(origemId: string, destinoId: string) {
    if (origemId === destinoId) return;
    const indiceOrigem = ordemStatus.indexOf(origemId as AmostraStatus);
    const indiceDestino = ordemStatus.indexOf(destinoId as AmostraStatus);
    if (indiceOrigem === -1 || indiceDestino === -1) return;
    const reordenada = arrayMove(ordemStatus, indiceOrigem, indiceDestino);
    setOrdemStatus(reordenada);
    try {
      localStorage.setItem(CHAVE_ORDEM_STATUS, JSON.stringify(reordenada));
    } catch {
      // localStorage indisponível — a ordem só dura a sessão atual.
    }
  }

  const colunaParaEditar = (colunasQuery.data ?? []).find((c) => c.id === colunaParaEditarId);

  const carregando = amostrasQuery.isLoading || produtosQuery.isLoading;
  const comErro = amostrasQuery.isError || produtosQuery.isError;
  const semDados = amostrasQuery.isSuccess && (amostrasQuery.data?.length ?? 0) === 0;

  return (
    <div>
      <PageHeader
        titulo="Amostras"
        descricao="Do pedido ao conteúdo publicado, com prazo cobrado."
        acao={
          <Button onClick={() => setModalNovaAberto(true)} disabled={(produtosQuery.data ?? []).length === 0}>
            <Plus size={16} />
            Nova amostra
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs
          options={[
            { value: "quadro", label: "Quadro" },
            { value: "tabela", label: "Tabela" },
          ]}
          value={visao}
          onChange={setVisao}
        />
      </div>

      {carregando && <Spinner label="Carregando amostras..." />}

      {comErro && <ErrorState onTentarNovamente={() => amostrasQuery.refetch()} />}

      {!carregando && !comErro && semDados && (
        <EmptyState
          icon={Gift}
          titulo="Nenhuma amostra pedida ainda"
          descricao="Crie uma amostra a partir de um produto pra começar a cobrar prazo de conteúdo."
          acao={
            (produtosQuery.data ?? []).length > 0 ? (
              <Button onClick={() => setModalNovaAberto(true)}>
                <Plus size={16} />
                Nova amostra
              </Button>
            ) : undefined
          }
        />
      )}

      {!carregando && !comErro && !semDados && visao === "quadro" && (
        <AmostraBoard
          colunas={colunas}
          produtosPorId={produtosPorId}
          onMoverAmostra={handleMoverAmostra}
          onRemoverColuna={handleRemoverColuna}
          onEditarColuna={setColunaParaEditarId}
          onReordenarColuna={handleReordenarColuna}
          onReordenarStatus={handleReordenarStatus}
          onDefinirPrazo={setAmostraParaPrazo}
          rodape={<NovaColunaBotao />}
        />
      )}

      {!carregando && !comErro && !semDados && visao === "tabela" && (
        <AmostraTable amostras={amostrasQuery.data ?? []} produtosPorId={produtosPorId} />
      )}

      <PrazoModal amostra={amostraParaPrazo} onFechar={() => setAmostraParaPrazo(undefined)} />
      <EditarColunaModal coluna={colunaParaEditar} onFechar={() => setColunaParaEditarId(undefined)} />
      <NovaAmostraModal
        aberto={modalNovaAberto}
        onFechar={() => setModalNovaAberto(false)}
        produtos={produtosQuery.data ?? []}
      />
    </div>
  );
}
