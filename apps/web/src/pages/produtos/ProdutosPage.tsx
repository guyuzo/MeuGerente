import type { Produto } from "@meugerente/shared";
import { Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { Tabs } from "../../components/ui/Tabs";
import { useAmostras } from "../../hooks/useAmostras";
import { useCategorias } from "../../hooks/useCategorias";
import { useAtualizarProduto, useProdutos } from "../../hooks/useProdutos";
import { CriarConteudoModal } from "./CriarConteudoModal";
import { ProdutoFiltros, FILTROS_INICIAIS, type ProdutoFiltrosState } from "./ProdutoFiltros";
import { ProdutoFormModal } from "./ProdutoFormModal";
import { ProdutoGrid } from "./ProdutoGrid";
import { ProdutoTable } from "./ProdutoTable";

type Visao = "tabela" | "grade";

export function ProdutosPage() {
  const produtosQuery = useProdutos();
  const amostrasQuery = useAmostras();
  const categoriasQuery = useCategorias();
  const atualizarProduto = useAtualizarProduto();

  const [visao, setVisao] = useState<Visao>("tabela");
  const [filtros, setFiltros] = useState<ProdutoFiltrosState>(FILTROS_INICIAIS);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | undefined>();
  const [produtoParaConteudo, setProdutoParaConteudo] = useState<Produto | undefined>();

  const produtosComAmostra = useMemo(
    () => new Set((amostrasQuery.data ?? []).map((amostra) => amostra.produtoId)),
    [amostrasQuery.data],
  );

  const categoriasPorId = useMemo(
    () => new Map((categoriasQuery.data ?? []).map((categoria) => [categoria.id, categoria])),
    [categoriasQuery.data],
  );

  const produtosFiltrados = useMemo(() => {
    return (produtosQuery.data ?? []).filter((produto) => {
      if (!filtros.mostrarArquivados && produto.arquivado) return false;
      if (filtros.categoriaId !== "todas" && produto.categoriaId !== filtros.categoriaId) return false;
      if (filtros.comAmostra && !produtosComAmostra.has(produto.id)) return false;
      return true;
    });
  }, [produtosQuery.data, filtros, produtosComAmostra]);

  function handleArquivar(produto: Produto) {
    atualizarProduto.mutate({ id: produto.id, input: { arquivado: !produto.arquivado } });
  }

  return (
    <div>
      <PageHeader
        titulo="Produtos"
        descricao="Radar de produtos organizados por categoria."
        acao={
          <Button onClick={() => setModalNovoAberto(true)}>
            <Plus size={16} />
            Novo produto
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <ProdutoFiltros categorias={categoriasQuery.data ?? []} filtros={filtros} onChange={setFiltros} />
        <Tabs
          options={[
            { value: "tabela", label: "Tabela" },
            { value: "grade", label: "Grade" },
          ]}
          value={visao}
          onChange={setVisao}
        />
      </div>

      {produtosQuery.isLoading && <Spinner label="Carregando produtos..." />}

      {produtosQuery.isError && <ErrorState onTentarNovamente={() => produtosQuery.refetch()} />}

      {produtosQuery.isSuccess && produtosFiltrados.length === 0 && (
        <EmptyState
          icon={Package}
          titulo={produtosQuery.data.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto com esse filtro"}
          descricao={
            produtosQuery.data.length === 0
              ? "Cadastre o primeiro produto para começar a organizar o radar de trabalho."
              : "Ajuste os filtros para ver os produtos cadastrados."
          }
          acao={
            produtosQuery.data.length === 0 ? (
              <Button onClick={() => setModalNovoAberto(true)}>
                <Plus size={16} />
                Novo produto
              </Button>
            ) : undefined
          }
        />
      )}

      {produtosQuery.isSuccess && produtosFiltrados.length > 0 && visao === "tabela" && (
        <ProdutoTable
          produtos={produtosFiltrados}
          categoriasPorId={categoriasPorId}
          onEditar={setProdutoEmEdicao}
          onCriarConteudo={setProdutoParaConteudo}
          onArquivar={handleArquivar}
        />
      )}

      {produtosQuery.isSuccess && produtosFiltrados.length > 0 && visao === "grade" && (
        <ProdutoGrid
          produtos={produtosFiltrados}
          categoriasPorId={categoriasPorId}
          onEditar={setProdutoEmEdicao}
          onCriarConteudo={setProdutoParaConteudo}
          onArquivar={handleArquivar}
        />
      )}

      <ProdutoFormModal aberto={modalNovoAberto} onFechar={() => setModalNovoAberto(false)} />
      <ProdutoFormModal
        aberto={!!produtoEmEdicao}
        onFechar={() => setProdutoEmEdicao(undefined)}
        produtoEmEdicao={produtoEmEdicao}
      />
      <CriarConteudoModal produto={produtoParaConteudo} onFechar={() => setProdutoParaConteudo(undefined)} />
    </div>
  );
}
