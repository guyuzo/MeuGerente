import type { Categoria, CategoriaCreateInput, CategoriaUpdateInput } from "../types/categoria.js";

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
  criar(input: CategoriaCreateInput): Promise<Categoria>;
  atualizar(id: string, input: CategoriaUpdateInput): Promise<Categoria>;
  deletar(id: string): Promise<void>;
}
