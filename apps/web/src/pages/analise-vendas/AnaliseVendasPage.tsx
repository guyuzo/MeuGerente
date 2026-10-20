import type { ProdutoOverrideImportacao } from "@meugerente/shared";
import { ChevronLeft, ChevronRight, TrendingUp, Upload } from "lucide-react";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { CardMetrica } from "../../components/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card, CardInterno } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { NOMES_MES } from "../../lib/calendar-utils";
import { useAnalisarVendas, useImportarVendas, useResumoVendas } from "../../hooks/useVendas";
import { formatarMoeda } from "../../lib/utils";
import { RevisarImportacaoModal } from "./RevisarImportacaoModal";

export function AnaliseVendasPage() {
  const [referencia, setReferencia] = useState(new Date());
  const periodo = useMemo(() => {
    const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1);
    return { inicio: inicio.toISOString(), fim: fim.toISOString() };
  }, [referencia]);

  const resumoQuery = useResumoVendas(periodo);
  const analisar = useAnalisarVendas();
  const importar = useImportarVendas();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState("");
  const [arquivoParaRevisar, setArquivoParaRevisar] = useState<File | undefined>();
  const [erroRevisao, setErroRevisao] = useState("");

  function navegar(direcao: -1 | 0 | 1) {
    if (direcao === 0) return setReferencia(new Date());
    setReferencia((atual) => {
      const proxima = new Date(atual);
      proxima.setMonth(proxima.getMonth() + direcao);
      return proxima;
    });
  }

  function relatarResultado(resumo: { linhasProcessadas: number; produtosCriados: number; linhasIgnoradas: number }) {
    setMensagem(
      `${resumo.linhasProcessadas} pedidos importados` +
        (resumo.produtosCriados > 0 ? `, ${resumo.produtosCriados} produto(s) novo(s) criado(s)` : "") +
        (resumo.linhasIgnoradas > 0 ? `. ${resumo.linhasIgnoradas} linha(s) ignorada(s) (sem produto/pedido).` : "."),
    );
  }

  async function handleArquivoSelecionado(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    setMensagem("");
    try {
      const analise = await analisar.mutateAsync(arquivo);
      if (analise.produtosNovos.length > 0) {
        setArquivoParaRevisar(arquivo);
        return;
      }
      relatarResultado(await importar.mutateAsync({ arquivo }));
    } catch (erro) {
      setMensagem(
        `Não deu pra analisar essa planilha (${erro instanceof Error ? erro.message : "erro desconhecido"}). Confira se é a exportação de pedidos do TikTok Shop Affiliate Center.`,
      );
    }
  }

  async function handleConfirmarRevisao(overrides: Record<string, ProdutoOverrideImportacao>) {
    if (!arquivoParaRevisar) return;
    setErroRevisao("");
    try {
      relatarResultado(await importar.mutateAsync({ arquivo: arquivoParaRevisar, overrides }));
      setArquivoParaRevisar(undefined);
    } catch (erro) {
      setErroRevisao(`Não deu pra importar (${erro instanceof Error ? erro.message : "erro desconhecido"}). Tente de novo.`);
    }
  }

  const botaoImportar = (
    <>
      <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleArquivoSelecionado} />
      <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={analisar.isPending || importar.isPending}>
        <Upload size={16} />
        {analisar.isPending ? "Analisando..." : importar.isPending ? "Importando..." : "Importar planilha (.xlsx)"}
      </Button>
    </>
  );

  const resumo = resumoQuery.data;
  const semDados = resumoQuery.isSuccess && (resumo?.pedidos ?? 0) === 0 && (resumo?.gmvTotal ?? 0) === 0;
  const porStatus = resumo?.porStatus ?? {};

  return (
    <div>
      <PageHeader
        titulo="Análise de Vendas"
        descricao="GMV e comissão a partir da exportação de pedidos do TikTok Shop Affiliate Center."
        acao={botaoImportar}
      />

      {mensagem && <p className="text-caption text-neutral-600 mb-4 -mt-2">{mensagem}</p>}

      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="Mês anterior"
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
          aria-label="Próximo mês"
          onClick={() => navegar(1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
        >
          <ChevronRight size={16} />
        </button>
        <Button variant="secondary" onClick={() => navegar(0)}>
          Mês atual
        </Button>
      </div>

      {resumoQuery.isLoading && <Spinner label="Carregando vendas..." />}
      {resumoQuery.isError && <ErrorState onTentarNovamente={() => resumoQuery.refetch()} />}

      {!resumoQuery.isLoading && !resumoQuery.isError && semDados && (
        <EmptyState
          icon={TrendingUp}
          titulo={`Nenhuma venda em ${NOMES_MES[referencia.getMonth()]} ${referencia.getFullYear()}`}
          descricao="Exporte 'Pedidos de afiliado' no TikTok Shop Affiliate Center e importe a planilha aqui."
          acao={botaoImportar}
        />
      )}

      {!resumoQuery.isLoading && !resumoQuery.isError && resumo && !semDados && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <CardMetrica label="GMV total" valor={formatarMoeda(resumo.gmvTotal)} />
            <CardMetrica
              label="Comissão confirmada"
              valor={formatarMoeda(resumo.comissaoConfirmada)}
              nota={`de ${formatarMoeda(resumo.comissaoTotal)} no total`}
              destaque
            />
            <CardMetrica label="Pedidos" valor={String(resumo.pedidos)} />
            <CardMetrica label="Itens vendidos" valor={String(resumo.itensVendidos)} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 max-w-xl">
            <CardMetrica label="Cliente não pagou" valor={String(porStatus.aguardando_pagamento ?? 0)} />
            <CardMetrica label="Cancelados" valor={String(porStatus.cancelado ?? 0)} />
            <CardMetrica label="Inelegíveis" valor={String(porStatus.inelegivel ?? 0)} />
          </div>

          <Card className="max-w-xl">
            <h2 className="text-h3 text-neutral-900 mb-3">Top produtos por GMV</h2>
            <div className="flex flex-col gap-2">
              {resumo.topProdutos.map((produto) => (
                <CardInterno key={produto.produtoId} className="flex items-center justify-between gap-3">
                  <span className="text-body-strong font-medium truncate">{produto.nome}</span>
                  <div className="flex items-center gap-4 shrink-0 text-caption text-neutral-600">
                    <span>{produto.pedidos} pedidos</span>
                    <span className="text-body-strong font-medium text-neutral-900">{formatarMoeda(produto.gmv)}</span>
                  </div>
                </CardInterno>
              ))}
            </div>
          </Card>
        </>
      )}

      <RevisarImportacaoModal
        aberto={Boolean(arquivoParaRevisar)}
        produtosNovos={analisar.data?.produtosNovos ?? []}
        confirmando={importar.isPending}
        erro={erroRevisao}
        onFechar={() => setArquivoParaRevisar(undefined)}
        onConfirmar={handleConfirmarRevisao}
      />
    </div>
  );
}
