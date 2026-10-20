export type AmostraColunaCor = "neutral" | "success" | "warning" | "error" | "accent" | "blue";

/** Coluna extra do quadro de Amostras, criada livremente pelo usuário — não mexe no status/prazo da amostra. */
export interface AmostraColuna {
  id: string;
  nome: string;
  cor: AmostraColunaCor;
  ordem: number;
  criadoEm: string;
}

export type AmostraColunaCreateInput = Pick<AmostraColuna, "nome" | "cor">;
export type AmostraColunaUpdateInput = Partial<Pick<AmostraColuna, "nome" | "cor" | "ordem">>;
