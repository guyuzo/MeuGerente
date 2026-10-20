export type RoteiroPublico = "frio" | "morno" | "quente";

export interface Roteiro {
  id: string;
  conteudoId: string;
  produtoId: string;
  publico: RoteiroPublico;
  gancho: string;
  corpo: string;
  cta: string;
  versao: number;
  geradoPorIa: boolean;
  modeloIa?: string;
  editadoManualmente: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export type RoteiroCreateInput = Pick<Roteiro, "conteudoId" | "produtoId" | "publico" | "gancho" | "corpo" | "cta"> &
  Partial<Pick<Roteiro, "geradoPorIa" | "modeloIa">>;

export type RoteiroUpdateInput = Partial<Pick<Roteiro, "gancho" | "corpo" | "cta" | "editadoManualmente">>;
