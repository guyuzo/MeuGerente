export type ProdutoStatus = "radar" | "ativo" | "pausado" | "descartado";

export type ProdutoFonte = "api" | "manual";

export interface Produto {
  id: string;
  tiktokProductId?: string;
  /** Nome exatamente como veio na planilha na primeira importação — chave de casamento pra reimportar sem duplicar, mesmo se `nome` for editado depois. */
  nomeImportado?: string;
  fonte: ProdutoFonte;
  sincronizadoEm?: string;
  nome: string;
  emoji?: string;
  loja?: string;
  categoriaId?: string;
  linkTiktok?: string;
  imagemUrl?: string;
  preco?: number;
  comissaoPct?: number;
  comissaoValor?: number;
  status: ProdutoStatus;
  notaPotencial?: number;
  observacao?: string;
  arquivado: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export type ProdutoCreateInput = Pick<
  Produto,
  "nome" | "emoji" | "loja" | "categoriaId" | "linkTiktok" | "imagemUrl" | "preco" | "comissaoPct" | "observacao"
> &
  Partial<Pick<Produto, "tiktokProductId" | "nomeImportado" | "fonte" | "status">>;

export type ProdutoUpdateInput = Partial<ProdutoCreateInput> & {
  notaPotencial?: number;
  arquivado?: boolean;
};
