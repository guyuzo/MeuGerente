import type { Produto, ResumoVendas, Venda, VendaStatusPedido } from "@meugerente/shared";

/** Agrega as vendas importadas/sincronizadas em cartões de KPI + ranking de produto por GMV. */
export function resumirVendas(vendas: Venda[], produtosPorId: Map<string, Produto>): ResumoVendas {
  const porProduto = new Map<string, { gmv: number; pedidos: number }>();
  const porStatus: Partial<Record<VendaStatusPedido, number>> = {};

  let gmvTotal = 0;
  let comissaoTotal = 0;
  let comissaoConfirmada = 0;
  let pedidos = 0;
  let itensVendidos = 0;

  for (const venda of vendas) {
    gmvTotal += venda.gmv;
    comissaoTotal += venda.comissao;
    if (venda.comissaoConfirmada) comissaoConfirmada += venda.comissao;
    pedidos += venda.pedidos;
    itensVendidos += venda.itens;
    porStatus[venda.statusPedido] = (porStatus[venda.statusPedido] ?? 0) + venda.pedidos;

    const acumulado = porProduto.get(venda.produtoId) ?? { gmv: 0, pedidos: 0 };
    acumulado.gmv += venda.gmv;
    acumulado.pedidos += venda.pedidos;
    porProduto.set(venda.produtoId, acumulado);
  }

  const topProdutos = [...porProduto.entries()]
    .map(([produtoId, valores]) => ({
      produtoId,
      nome: produtosPorId.get(produtoId)?.nome ?? "Produto removido",
      ...valores,
    }))
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 10);

  return { gmvTotal, comissaoTotal, comissaoConfirmada, pedidos, itensVendidos, topProdutos, porStatus };
}
