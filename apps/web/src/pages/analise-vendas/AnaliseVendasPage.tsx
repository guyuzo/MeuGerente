import type { AnaliseAvulsaVendas, ProdutoOverrideImportacao } from "@meugerente/shared";
import { ChevronLeft, ChevronRight, FileSearch, TrendingUp, Upload, X } from "lucide-react";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Spinner } from "../../components/ui/Spinner";
import { NOMES_MES } from "../../lib/calendar-utils";
import { useAnaliseAvulsaVendas, useAnalisarVendas, useImportarVendas, useResumoVendas } from "../../hooks/useVendas";
import { formatarData } from "../../lib/utils";
import { RevisarImportacaoModal } from "./RevisarImportacaoModal";
import { ResumoVendasPainel } from "./ResumoVendasPainel";

const MENSAGEM_PLANILHA_INVALIDA = "Confira se é a exportação de pedidos do TikTok Shop Affiliate Center.";

function descreverErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "erro desconhecido";
}

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
  const analiseAvulsaMutation = useAnaliseAvulsaVendas();
  const inputImportarRef = useRef<HTMLInputElement>(null);
  const inputAvulsaRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState("");
  const [arquivoParaRevisar, setArquivoParaRevisar] = useState<File | undefined>();
  const [erroRevisao, setErroRevisao] = useState("");
  const [analiseAvulsa, setAnaliseAvulsa] = useState<{ arquivo: File; resultado: AnaliseAvulsaVendas } | undefined>();

  const ocupado = analisar.isPending || importar.isPending || analiseAvulsaMutation.isPending;

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

  async function importarArquivo(arquivo: File) {
    setMensagem("");
    try {
      const analise = await analisar.mutateAsync(arquivo);
      if (analise.produtosNovos.length > 0) {
        setArquivoParaRevisar(arquivo);
        return;
      }
      relatarResultado(await importar.mutateAsync({ arquivo }));
    } catch (erro) {
      setMensagem(`Não deu pra analisar essa planilha (${descreverErro(erro)}). ${MENSAGEM_PLANILHA_INVALIDA}`);
    }
  }

  async function analisarSemSalvar(arquivo: File) {
    setMensagem("");
    try {
      setAnaliseAvulsa({ arquivo, resultado: await analiseAvulsaMutation.mutateAsync(arquivo) });
    } catch (erro) {
      setMensagem(`Não deu pra analisar essa planilha (${descreverErro(erro)}). ${MENSAGEM_PLANILHA_INVALIDA}`);
    }
  }

  function aoEscolherArquivo(acao: (arquivo: File) => Promise<void>) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const arquivo = e.target.files?.[0];
      e.target.value = "";
      if (arquivo) void acao(arquivo);
    };
  }

  function salvarAnaliseNoHistorico() {
    if (!analiseAvulsa) return;
    const { arquivo } = analiseAvulsa;
    setAnaliseAvulsa(undefined);
    void importarArquivo(arquivo);
  }

  async function handleConfirmarRevisao(overrides: Record<string, ProdutoOverrideImportacao>) {
    if (!arquivoParaRevisar) return;
    setErroRevisao("");
    try {
      relatarResultado(await importar.mutateAsync({ arquivo: arquivoParaRevisar, overrides }));
      setArquivoParaRevisar(undefined);
    } catch (erro) {
      setErroRevisao(`Não deu pra importar (${descreverErro(erro)}). Tente de novo.`);
    }
  }

  const inputsArquivo = (
    <>
      <input ref={inputImportarRef} type="file" accept=".xlsx" className="hidden" onChange={aoEscolherArquivo(importarArquivo)} />
      <input ref={inputAvulsaRef} type="file" accept=".xlsx" className="hidden" onChange={aoEscolherArquivo(analisarSemSalvar)} />
    </>
  );

  const botaoAnalisarSemSalvar = (
    <Button variant="secondary" onClick={() => inputAvulsaRef.current?.click()} disabled={ocupado}>
      <FileSearch size={16} />
      {analiseAvulsaMutation.isPending ? "Analisando..." : "Analisar sem salvar"}
    </Button>
  );

  const botaoImportar = (
    <Button variant="secondary" onClick={() => inputImportarRef.current?.click()} disabled={ocupado}>
      <Upload size={16} />
      {analisar.isPending ? "Analisando..." : importar.isPending ? "Importando..." : "Importar planilha (.xlsx)"}
    </Button>
  );

  const botoes = (
    <div className="flex flex-wrap gap-2">
      {botaoAnalisarSemSalvar}
      {botaoImportar}
    </div>
  );

  const resumo = resumoQuery.data;
  const semDados = resumoQuery.isSuccess && (resumo?.pedidos ?? 0) === 0 && (resumo?.gmvTotal ?? 0) === 0;

  return (
    <div>
      {inputsArquivo}
      <PageHeader
        titulo="Análise de Vendas"
        descricao="GMV e comissão a partir da exportação de pedidos do TikTok Shop Affiliate Center."
        acao={botoes}
      />

      {mensagem && <p className="text-caption text-neutral-600 mb-4 -mt-2">{mensagem}</p>}

      {analiseAvulsa ? (
        <AnaliseAvulsaConteudo
          arquivo={analiseAvulsa.arquivo}
          resultado={analiseAvulsa.resultado}
          salvando={ocupado}
          onSalvar={salvarAnaliseNoHistorico}
          onFechar={() => setAnaliseAvulsa(undefined)}
        />
      ) : (
        <>
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
              descricao="Exporte 'Pedidos de afiliado' no TikTok Shop Affiliate Center e importe a planilha aqui — ou só analise, sem salvar nada."
              acao={botoes}
            />
          )}

          {!resumoQuery.isLoading && !resumoQuery.isError && resumo && !semDados && <ResumoVendasPainel resumo={resumo} />}
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

interface AnaliseAvulsaConteudoProps {
  arquivo: File;
  resultado: AnaliseAvulsaVendas;
  salvando: boolean;
  onSalvar: () => void;
  onFechar: () => void;
}

function AnaliseAvulsaConteudo({ arquivo, resultado, salvando, onSalvar, onFechar }: AnaliseAvulsaConteudoProps) {
  const periodo =
    resultado.inicio && resultado.fim
      ? `Pedidos de ${formatarData(resultado.inicio)} a ${formatarData(resultado.fim)}.`
      : undefined;

  return (
    <>
      <Card className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-body-strong font-medium text-neutral-900 break-words">Análise avulsa: {arquivo.name}</p>
          <p className="text-caption text-neutral-600 mt-1">
            Nada foi salvo: nenhuma venda e nenhum produto. {periodo}
            {resultado.linhasIgnoradas > 0 && ` ${resultado.linhasIgnoradas} linha(s) ignorada(s) (sem produto/pedido).`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="secondary" onClick={onSalvar} disabled={salvando}>
            <Upload size={16} />
            Salvar no histórico
          </Button>
          <Button variant="ghost" onClick={onFechar}>
            <X size={16} />
            Fechar análise
          </Button>
        </div>
      </Card>

      {resultado.pedidos === 0 ? (
        <EmptyState
          icon={TrendingUp}
          titulo="Nenhum pedido nessa planilha"
          descricao={MENSAGEM_PLANILHA_INVALIDA}
          acao={
            <Button variant="secondary" onClick={onFechar}>
              Voltar ao histórico
            </Button>
          }
        />
      ) : (
        <ResumoVendasPainel resumo={resultado} />
      )}
    </>
  );
}
