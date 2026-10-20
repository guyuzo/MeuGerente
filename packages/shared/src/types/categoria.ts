export type CategoriaCor =
  | "neutral"
  | "rose"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "fuchsia"
  | "pink";

export interface Categoria {
  id: string;
  nome: string;
  cor: CategoriaCor;
  emoji?: string;
  criadoEm: string;
}

export type CategoriaCreateInput = Pick<Categoria, "nome" | "cor" | "emoji">;
export type CategoriaUpdateInput = Partial<Pick<Categoria, "nome" | "cor" | "emoji">>;
