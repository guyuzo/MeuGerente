import type { ResumoVendas } from "@meugerente/shared";
import { CardMetrica } from "../../components/shared";
import { Card, CardInterno } from "../../components/ui/Card";
import { formatarMoeda } from "../../lib/utils";

/** Cartões de KPI + top produtos. Mesmo painel pro histórico do mês e pra análise avulsa de uma planilha. */
export function ResumoVendasPainel({ resumo }: { resumo: ResumoVendas }) {
  const porStatus = resumo.porStatus;

  return (
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
  );
}
