export type VendaOrigem = "video" | "live" | "vitrine" | "outro";

export type VendaStatusPedido =
  | "pendente"
  | "aguardando_pagamento"
  | "enviado"
  | "concluido"
  | "cancelado"
  | "inelegivel"
  | "devolvido";

export type VendaFonte = "api" | "importacao";

export interface Venda {
  id: string;
  tiktokOrderId: string;
  produtoId: string;
  conteudoId?: string;
  data: string;
  origem: VendaOrigem;
  statusPedido: VendaStatusPedido;
  pedidos: number;
  itens: number;
  gmv: number;
  comissao: number;
  /** Comissão só conta como real depois do pedido concluído (PRD seção 7) — o Dashboard soma só quando true. */
  comissaoConfirmada: boolean;
  fonte: VendaFonte;
  sincronizadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type VendaCreateInput = Pick<
  Venda,
  "tiktokOrderId" | "produtoId" | "data" | "origem" | "statusPedido" | "pedidos" | "itens" | "gmv" | "comissao" | "fonte"
> &
  Partial<Pick<Venda, "conteudoId" | "comissaoConfirmada" | "sincronizadoEm">>;

/** Sync/importação reprocessa a mesma venda várias vezes — só estes campos mudam entre rodadas (PRD 6.4, regra 2 e 3). */
export type VendaUpdateInput = Partial<
  Pick<Venda, "conteudoId" | "statusPedido" | "comissaoConfirmada" | "gmv" | "comissao" | "sincronizadoEm">
>;

export interface ResumoImportacaoVendas {
  linhasProcessadas: number;
  linhasIgnoradas: number;
  produtosCriados: number;
}

export interface ResumoVendasProduto {
  produtoId: string;
  nome: string;
  gmv: number;
  pedidos: number;
}

export interface ResumoVendas {
  gmvTotal: number;
  comissaoTotal: number;
  comissaoConfirmada: number;
  pedidos: number;
  itensVendidos: number;
  topProdutos: ResumoVendasProduto[];
  /** Contagem de vendas por status — base dos cartões de "não pagou"/"cancelado"/"inelegível". */
  porStatus: Partial<Record<VendaStatusPedido, number>>;
}

/** Produto que a planilha traz e ainda não bate com nenhum já cadastrado — usuário revisa antes de criar. */
export interface ProdutoSugeridoImportacao {
  nomeImportado: string;
  nomeSugerido: string;
  lojaSugerida?: string;
  precoSugerido?: number;
  comissaoPctSugerida?: number;
  linhas: number;
}

export interface AnaliseImportacaoVendas {
  produtosNovos: ProdutoSugeridoImportacao[];
  produtosReconhecidos: number;
  linhasTotais: number;
}

/** Ajuste que o usuário faz no popup de revisão antes de confirmar a importação. */
export interface ProdutoOverrideImportacao {
  nome?: string;
  categoriaId?: string;
}
