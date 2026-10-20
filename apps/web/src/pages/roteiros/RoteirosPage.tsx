import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Select } from "../../components/ui/Select";
import { Spinner } from "../../components/ui/Spinner";
import { useConteudos } from "../../hooks/useConteudos";
import { useProdutos } from "../../hooks/useProdutos";
import { useRoteirosPorProduto } from "../../hooks/useRoteiros";
import { RoteiroBiblioteca } from "./RoteiroBiblioteca";
import { RoteiroForm } from "./RoteiroForm";

export function RoteirosPage() {
  const produtosQuery = useProdutos();
  const conteudosQuery = useConteudos();
  const [produtoId, setProdutoId] = useState("");

  const produto = produtosQuery.data?.find((p) => p.id === produtoId);
  const conteudosDoProduto = useMemo(
    () => (conteudosQuery.data ?? []).filter((c) => c.produtoId === produtoId),
    [conteudosQuery.data, produtoId],
  );

  const roteirosQuery = useRoteirosPorProduto(produtoId || undefined);

  const carregando = produtosQuery.isLoading || conteudosQuery.isLoading;
  const comErro = produtosQuery.isError || conteudosQuery.isError;

  return (
    <div>
      <PageHeader titulo="Roteiros" descricao="Gerar, editar e reaproveitar roteiro por produto e público (PRD 8.5)." />

      {carregando && <Spinner label="Carregando produtos..." />}
      {comErro && <ErrorState onTentarNovamente={() => produtosQuery.refetch()} />}

      {!carregando && !comErro && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <Select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className="mb-4">
                <option value="">Selecione um produto</option>
                {(produtosQuery.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>

              {!produto && (
                <EmptyState
                  icon={FileText}
                  titulo="Escolha um produto para gerar roteiro"
                  descricao="O roteiro usa nome, categoria, preço e comissão do produto — nada inventado."
                />
              )}

              {produto && conteudosDoProduto.length === 0 && (
                <EmptyState
                  icon={FileText}
                  titulo="Este produto ainda não tem conteúdo agendado"
                  descricao="Crie um conteúdo em Produtos antes de gerar o roteiro, já que ele precisa ficar vinculado a um conteúdo."
                />
              )}

              {produto && conteudosDoProduto.length > 0 && (
                <RoteiroForm
                  produto={produto}
                  conteudosDoProduto={conteudosDoProduto}
                  onSalvo={() => roteirosQuery.refetch()}
                />
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            {produto ? (
              roteirosQuery.isLoading ? (
                <Spinner label="Carregando roteiros..." />
              ) : (
                <RoteiroBiblioteca roteiros={roteirosQuery.data ?? []} />
              )
            ) : (
              <EmptyState icon={FileText} titulo="A biblioteca aparece aqui" descricao="Escolha um produto ao lado." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
