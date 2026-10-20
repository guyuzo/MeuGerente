import type { AmostraColuna, AmostraColunaCreateInput, AmostraColunaUpdateInput } from "../types/amostra-coluna.js";

export interface AmostraColunaRepository {
  listar(): Promise<AmostraColuna[]>;
  criar(input: AmostraColunaCreateInput): Promise<AmostraColuna>;
  atualizar(id: string, input: AmostraColunaUpdateInput): Promise<AmostraColuna>;
  deletar(id: string): Promise<void>;
}
