export type AmostraStatus = "para_publicar" | "publicado" | "vendida" | "descartada";

export type AmostraOrigem = "gratuita" | "comprada" | "parceria";

export interface Amostra {
  id: string;
  produtoId: string;
  status: AmostraStatus;
  origem: AmostraOrigem;
  custo: number;
  dataSolicitacao?: string;
  dataRecebimento?: string;
  /** Quando o card entrou em "Publicado" — base do contador de dias. */
  publicadoEm?: string;
  prazoConteudo?: string;
  codigoRastreio?: string;
  observacao?: string;
  /** Coluna extra do quadro (fora do pipeline fixo) — não substitui `status`, só onde o card aparece. */
  colunaCustomizadaId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type AmostraCreateInput = Pick<Amostra, "produtoId" | "origem" | "custo"> &
  Partial<Pick<Amostra, "dataSolicitacao" | "codigoRastreio" | "observacao">>;

export type AmostraUpdateInput = Partial<
  Pick<Amostra, "dataRecebimento" | "prazoConteudo" | "codigoRastreio" | "observacao" | "origem" | "custo">
> & {
  /** `null` limpa a coluna customizada — volta o card pro pipeline fixo por status. */
  colunaCustomizadaId?: string | null;
};

/** Amostra pronta pra publicar sem conteúdo publicado até prazoConteudo — regra do PRD seção 7 (bloco "Em risco"). */
export function amostraEmRisco(amostra: Amostra, hoje: Date = new Date()): boolean {
  if (amostra.status !== "para_publicar" || !amostra.prazoConteudo) return false;
  return new Date(amostra.prazoConteudo) < hoje;
}
